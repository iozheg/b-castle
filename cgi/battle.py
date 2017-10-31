'''
Created on 16 sept. 2015.

@author: admin
'''

import datetime
from hashlib import md5
#from random import uniform

from conf import *
from world import World

class Battle(object):
    '''
    Battle objects contains game between two players. Handles game events.
    '''


    def __init__(self, player1, player2, world):
        self.p1 = player1
        self.p2 = player2
        self.p1_health = 100
        self.p2_health = 100
        self.leading_player = player1
        self.turn_start_time = datetime.datetime.now()
        self.turn = player1
        self.p1_end_turn = False
        self.p2_end_turn = False
        self.terrain, self.wind_force = world.get_world_params()
        self.id = md5(
                str(world.get_short_terrain).encode('utf-8')
            ).hexdigest()
        self.log = []
        self.status = "active"
        self.number_of_turns = 1
        
        self.introduce_players()

    def introduce_players(self):
        self.p1.init_battle(
            battle=self, 
            opponent=self.p2,
            side=:"player1"
        )
        self.p2.init_battle(
            battle=self, 
            opponent=self.p1,
            side=:"player2"
        )
        
        ### may be client instance must send messages by it self?
        self.p1.send_message(
            '{"type":"search", "opponent_id":{0}, "opponent_nick":{1},\
             "turn":"yes", "wind_force":{2}, "terrain":{3}}'
             .format(
                 self.p2.id, self.p2.nick, self.wind_force, self.terrain
             )
        )

        self.p2.send_message(
            '{"type":"search", "opponent_id":{0}, "opponent_nick":{1},\
             "turn":"no", "wind_force":{2}, "terrain":{3}}'
             .format(
                 self.p1.id, self.p1.nick, self.wind_force, self.terrain
             )
        )

    def next_turn(self, initiator):        
        """ Handling next turn event. 
        
        Waiting for "next turn" events from both players, 
        only than change active player. 
        """
        
        if self.status != "active":
            return
        
        if initiator == self.p1 and not self.p2_end_turn:
            self.p1_end_turn = True
        elif initiator == self.p2 and not self.p1_end_turn:
            self.p2_end_turn = True
        else:
            initiator = self.p1
            self.p1_end_turn = False
            self.p1_end_turn = False
            
            wind_force = round(uniform(MINWINDFORCE, MAXWINDFORCE), 1)
            self.turn_start_time = datetime.datetime.now()
            if self.turn == self.p1:
                self.turn = self.p2
            else:
                self.turn = self.p1
                                
            initiator.ws.send('{"type":"gamemsg", "event":"nextturn", "player":"' + self.turn.side
                            + '", "windforce":' + str(wind_force) + '}')
            initiator.opponent.ws.send('{"type":"gamemsg", "event":"nextturn", "player":"' + self.turn.side
                            + '", "windforce":' + str(wind_force) + '}')
            self.number_of_turns = self.number_of_turns + 1 
            
            self.log.append("type:nextturn, player:" + self.turn.side)
            
    def shot(self, initiator, data):
        
        ''' Handling shot event. 
        
        Active player sends message, than we send it to both players, 
        and they make shoot. 
        '''        
        initiator.ws.send('{"type":"gamemsg", "event":"shot", "player":"' + initiator.side
                    + '", "strength":' + str(data['strength'])
                    + ', "angle":'+ str(data["angle"]) +'}')
        initiator.opponent.ws.send('{"type":"gamemsg", "event":"shot", "player":"' + initiator.side
                    + '", "strength":' + str(data['strength'])
                    + ', "angle":'+ str(data["angle"]) +'}')
        
        self.log.append("type:shot, player: + initiator.side"
                    + ", strength:" + str(data['strength'])
                    + ", angle:" + str(data["angle"]))
                                    
    def aimchange(self, initiator, data):
        initiator.opponent.ws.send('{"type":"gamemsg", "event":"aimchange", "angle":'+ str(data["angle"]) +'}')
        
    def hit(self, initiator, data):
        
        ''' Get hit message from active player and resend it to both players. '''
        
        damage = 51
        
        if data["target"] == self.p1.side:
            self.p1_health -= damage
            
        elif  data["target"] == self.p2.side:
            self.p2_health -= damage
           
            
        print(self.p1_health)
        print(self.p2_health)
        
        initiator.ws.send('{"type":"gamemsg", "event":"hit", "player":"'+ str(data["target"]) 
                            +'", "damage":' + str(damage) + '}')
        initiator.opponent.ws.send('{"type":"gamemsg", "event":"hit", "player":"'+ str(data["target"]) 
                            +'", "damage":' + str(damage) + '}')
        
        if(self.p1_health <= 0):
                self.game_over(self.p2.side, "destroyed")
        elif(self.p2_health <= 0):
                self.game_over(self.p1.side, "destroyed")        
        
        self.log.append("type:gamemsg, event:hit, player:" + str(data["target"]) 
                            +", damage:" + str(data["damage"]))
    
    def game_over(self, winner, reason):
        self.p1.ws.send('{"type":"gamemsg", "event":"gameover", "player":"' + str(winner) + '", "reason":"' + reason + '"}')
        self.p2.ws.send('{"type":"gamemsg", "event":"gameover", "player":"' + str(winner) + '", "reason":"' + reason + '"}')
        self.status = "end"
        print(self.id)
        self.db.update_battle((self.number_of_turns, '\n'.join(self.log), self.id))
    
    def unexpected_game_end(self, initiator):
        
        self.log.append("type:message, event:stopgame, reason:connection lost with opponent")
        initiator.opponent.ws.send('{"type":"message", "event":"stopgame", "reason":"connection lost with opponent"}')
        self.status = "end"
        self.db.update_battle((self.number_of_turns, '\n'.join(self.log), self.id))
        
    def check_turn_duration(self):
        
     #   print datetime.datetime.now() - self.turn_start_time
    #    print datetime.timedelta(seconds=TURN_DURATION)
        
        if(datetime.datetime.now() - self.turn_start_time > datetime.timedelta(seconds=TURN_DURATION)):
            self.next_turn(None)