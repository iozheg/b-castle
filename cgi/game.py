import json

from messagehandler import MessageHandler
from client import Client
from world import World
from battle import Battle
from logger import Logger


class Game:
    
    players = []
    battles = []
    # Possible message's types:
    # 1. register
    # 2. search
    # 3. stopsearch
    # 4. gamemsg
    handlers = dict()

    def __init__(self):
        self.message_handler = MessageHandler()
        self.handlers['register'] = self.register_player
        self.handlers['search'] = self.search_opponent
        self.log = Logger()
    
    def handle_message(self, message, websocket=None):
        try:
            data = json.loads(message)
            data['websocket'] = websocket
        except e:
            return False #logger action

        try:
            self.handlers[data['type']](data)
        except KeyError as e:
            return False

    def register_player(self, data):
         try:
            LOCK.acquire()
            client = Client(data['token'], data['websocket'])
            players.append(client)
            client.id = players.index(client)

            client.send_message(
                '{"type":"register", "result":"registered"}'
            )
            print(
                "{}: Registered player with ID {}\n"
                .format(
                    datetime.datetime.now().strftime("%H:%M:%S"),
                    str(c.id)
                )
            )
            
        finally:
            LOCK.release()

    def remove_player(self, data):
        pass

    def search_opponent(self, data):
        try:
            LOCK.acquire()
            ##TEST FOR PLAYER? OR WEBSOCKET IS GOOD FOR AUTH?
            self.log.info("Opponent search started")

             
            
            # Terrain is generated every cycle of search, 
            # and not for every game. It gives less load for a server. 
            world = World()
            #terrain, wind_force = world.getWorldParams()    
            str_terr = json.dumps(terrain)

            amount_of_players = len(self.players)
            self.log.info("Amount of players:", str(amount_of_players))

            if amount_of_players < 2:
                return False #logger action
            
            player_generator = self.getPlayerReadyForBattle()

            while True:
                try:
                    player1 = next(player_generator)
                    player2 = next(player_generator)
                except StopIteration:
                    return #logger action: no players

                battle = Battle(player1, player2, world)
                self.battles.append(battle)
        
                players[i1].ws.send(
                    '{"type":"search", "opponent_id":"' 
                    + str(i2)
                    +  '", "opponent_nick":"' 
                    + players[i2].nick 
                    + '", "turn":"yes", "windforce":' 
                    + str(wind_force)
                    + ', "terrain":"' 
                    + str_terr 
                    + '"}'
                )
                players[i2].ws.send('{"type":"search", "opponent_id":"' + str(i1)
                                    +  '", "opponent_nick":"' + players[i1].nick + '", "turn":"no", "windforce":' + str(wind_force)
                                    + ', "terrain":"' + str_terr + '"}')
                print(
                    "{}: Found opponents: {} and {}\n"
                    .format(
                        datetime.datetime.now().strftime("%H:%M:%S"), 
                        str(i1), 
                        str(i2)
                    )
                )
                break
                    
        finally:
            LOCK.release()  
    
    def getTwoPlayersForBattle():
        """Return two players ready for battle.
        
        Return tuple of players or of Falses.
        If total amount of players < 2 than we can't find players.
        Consistently search players that ready for battle.
        """
        amount_of_players = len(self.players)
        self.log.info("Amount of players:", str(amount_of_players))

        if amount_of_players < 2:
            return (False, False)

        p1_index = 0
        while p1_index < (amount_of_players-1):
            if self.players[p1_index].is_ready_for_battle:
                p2_index= p1_index + 1
                while p2_index < amount_of_players:
                    if self.players[p2_index].is_ready_for_battle:
                        return (
                            self.players[p1_index],
                            self.players[p2_index]
                        )
                    p2_index += 1
            p1_index += 1

        return (False, False)

    def getPlayerReadyForBattle():
        while player in self.players:
            if player.is_ready_for_battle:
                yield player
