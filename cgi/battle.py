from datetime import datetime, timedelta
from random import uniform

import conf as config
from world import World

class Battle(object):
    """Battle manager between two players.
    
    Attributes:
        p1 (:obj:`Client`): Reference to first player.
        p2 (:obj:`Client`): Reference to second player.
        p1_health (int): p1 health level.
        p2_health (int): p2 health level.
        turn_start_time (datetime): When turn started.
        turn (str): Whose turn now. Values: 'player1', 'player2'.
        p1_end_turn (bool): Flag that show whether player 1 sent
            'nextturn' signal.
        p1_end_turn (bool): Flag that show whether player 2 sent
            'nextturn' signal.
        terrain (list of int): Terrain list.
        wind_force (float): Wind strength. Negative number - wind blows
            left, positive - right.
        log (list of str): Battle log.
        status (str): Battle status. Values: 'active', 'end'.
        number_of_turns (int): Current amount of turns. For statistics.

    To start battle two players, terrain and wind force are needed.
    Terrain and wind force are provided by World instance.

    After battle started it waits for incoming events. Every 'battle'
    event is processed by corresponding method and players get
    notifications.

    Battle ends when one player is defeated, surrendered or connection
    was lost with one of the players.
    """

    def __init__(self, player1, player2, world):
        """Initiate battle and start.
        
        Flags self.p1_end_turn and self.p2_end_turn shows if both
        players sent 'nextturn' event. Next turn can be only if both
        sent.
        """
        self.p1 = player1
        self.p2 = player2
        self.p1_health = 100
        self.p2_health = 100
        self.turn_start_time = datetime.now()
        self.turn = 'player1'
        self.p1_end_turn = False
        self.p2_end_turn = False
        self.terrain = world.get_json_terrain()
        self.wind_force = world.get_wind_force()
        self.log = []
        self.status = "active"
        self.number_of_turns = 1
        
        self.p1.init_battle(
            battle=self, 
            opponent=self.p2,
            side="player1"
        )
        self.p2.init_battle(
            battle=self, 
            opponent=self.p1,
            side="player2"
        )        

    def manage_battle(self, initiator, data):
        """Manage all 'battle' events.

        Events 'nextturn', 'turntimeover' and 'surrender' don't depend
        on whether or not it is initiator's turn. At the same time 
        events 'shot', 'aimchange', 'hit' depend.
        """        
        event = data['event']

        if event == "nextturn":
            self.next_turn(initiator)

        elif event == "turntimeover":
            self.check_turn_duration()  

        elif event == "surrender":
            self.game_over(initiator.opponent.side, "surrender")

        elif initiator.side == self.turn:            

            if event == "shot" and is_number(data["angle"]):
                self.shot(initiator, data)
                
            elif event == "aimchange" and is_number(data["angle"]):
                self.aimchange(initiator, data)
                
            elif event == "hit":
                self.hit(initiator, data)
            
            else:
                print("Incorrect event")

    def next_turn(self, initiator):        
        """ Handling next turn event. 
        
        Waiting for "next turn" events from both players, 
        only than change active player. 
        Also if initiator == None than turn time ran out.
        
        Every turn new wind force generated.
        """        
        if self.status != "active":
            return
        
        if initiator == self.p1 and not self.p2_end_turn:
            self.p1_end_turn = True
        elif initiator == self.p2 and not self.p1_end_turn:
            self.p2_end_turn = True
        else:
            self.p1_end_turn = False
            self.p2_end_turn = False
            
            wind_force = round(
                uniform(config.MINWINDFORCE, config.MAXWINDFORCE),
                1
            )
            self.turn_start_time = datetime.now()
            if self.turn == self.p1.side:
                self.turn = self.p2.side
            else:
                self.turn = self.p1.side
                                
            message = '{{"type":"gamemsg", "event":"nextturn", \
                "player":"{}", "wind_force":{}}}'\
                .format(self.turn, str(wind_force))
            self.p1.send_message(message)
            self.p2.send_message(message)
            
            self.number_of_turns = self.number_of_turns + 1 
            
            self.log.append("type:nextturn, player:" + self.turn)
            
    def shot(self, initiator, data):        
        ''' Handling shot event. 
        
        Active player sends message, than we send it to both players, 
        and they make shoot. 
        '''        
        message = '{{"type":"gamemsg", "event":"shot", "player":"{}",\
            "strength":{}, "angle":{}}}'\
            .format(
                initiator.side, 
                str(data['strength']), 
                str(data["angle"])
            )
        self.p1.send_message(message)
        self.p2.send_message(message)
        
        self.log.append("type:shot, player: + initiator.side"
                    + ", strength:" + str(data['strength'])
                    + ", angle:" + str(data["angle"]))
                                    
    def aimchange(self, initiator, data):
        """Notify opponent that aim angle changed.

        This is necessary for visual effects: opponent should see
        how other player changes his aim.
        """
        initiator.opponent.send_message(
            '{{"type":"gamemsg", "event":"aimchange", "angle":{}}}'
            .format(str(data["angle"]))
        )
        
    def hit(self, initiator, data):        
        """Hit event handler.
        
        Get hit message from active player, decrease his opponent's
        health level and notify both players.
        If health level of one of the players <= 0 than end game.
        """        
        damage = 51
        # TODO: both players should send hit signal
        if initiator.side != self.turn:
            return

        if data["player"] == self.p1.side:
            self.p1_health -= damage
            
        elif  data["player"] == self.p2.side:
            self.p2_health -= damage

        message = '{{"type":"gamemsg", "event":"hit", "player":"{}",\
            "damage":{}}}'.format(str(data["player"]), str(damage))        
        self.p1.send_message(message)
        self.p2.send_message(message)
        
        if(self.p1_health <= 0):
                self.game_over(self.p2.side, "destroyed")
        elif(self.p2_health <= 0):
                self.game_over(self.p1.side, "destroyed")        
        
        self.log.append(
            "type:gamemsg, event:hit, player:" 
            + str(data["player"]) +", damage:" + str(data["damage"])
        )
    
    def game_over(self, winner, reason):
        """Notify players about game end.
        
        Here we notify players that game ended because of player was
        defeated or surrendered.
        """
        message = '{{"type":"gamemsg", "event":"gameover",\
            "player":"{}", "reason":"{}"}}'.format(winner, reason)
        self.p1.send_message(message)
        self.p2.send_message(message)
        self.p1.initial_state()
        self.p2.initial_state()
        self.status = "end"
    
    def unexpected_game_end(self, initiator):
        """Notify player that connection lost with his opponent.

        Here we notify player that game ended because of non-game 
        event.
        """
        self.log.append(
            "type:message, event:stopgame, \
            reason:connection lost with opponent"
        )
        initiator.opponent.send_message(
            '{"type":"message", "event":"stopgame", \
            "reason":"connection lost with opponent"}'
        )
        initiator.opponent.initial_state()
        self.status = "end"
        
    def check_turn_duration(self):
        """Check current turn duration.

        When player signals that turn's time ran out, 
        we check is it true.
        If so than we call self.next_turn to make next turn. 
        """
        current_turn_duration = datetime.now() - self.turn_start_time
        turn_max_duration = timedelta(seconds=config.TURN_DURATION)
        if(current_turn_duration > turn_max_duration):
            self.next_turn(None)

def is_number(x):
    try:
        float(x)
        return True
    except ValueError:
        return False 