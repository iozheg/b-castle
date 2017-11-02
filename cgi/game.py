import json
import threading

#from messagehandler import MessageHandler
from client import Client
from world import World
from battle import Battle
from logger import Logger

LOCK = threading.RLock()

class Game:
    """Game handler.
    
    Attributes:
        players (list of `Client`): list of players.
        battles (list of `Battle`): list of battles.
        handlers (dict of str:method): dict of methods that handle
            game events. Keys - message's type. Possible message's
            types:
                1. register
                2. search
                3. stopsearch
                4. gamemsg
        log (:obj:`Logger`): Logger object.
    """

    def __init__(self):
        """Declare attrs and register handlers."""
        self.handlers = dict()
        self.players = []
        self.battles = []
        self.handlers['register'] = self.register_player
        self.handlers['search'] = self.search_opponent
        self.handlers['stopsearch'] = self.player_not_ready
        self.handlers['gamemsg'] = self.manage_battle
        self.log = Logger()
    
    def handle_message(self, message, websocket=None):
        """Calls appropriate method to handle message."""
        try:
            data = json.loads(message)
            data['websocket'] = websocket
        except JSONDecodeError as e:
            self.log.error(e, None, message)
            return False

        try:
            self.handlers[data['type']](data)
        except KeyError as e:            
            self.log.error(e, None, message)
            return False

    def register_player(self, data):
        """Registers new player."""
        try:
            LOCK.acquire()
            client = Client(data['token'], data['websocket'])
            self.players.append(client)
            client.register(self.players.index(client))

            self.log.info("Registered player with ID", str(client.id))
        finally:
            LOCK.release()

    def remove_player(self, player_token):
        """Removes player.
        
        This used after client disconnected, willingly or not.
        Also remove battle if player taked part in it.
        """        
        player = self.get_player_by_token(player_token)

        if not player:
            self.log.info("No such player.", player_token)
            return False

        try:            
            LOCK.acquire()
            if player.battle:
                player.battle.unexpected_game_end(player)
                self.battles.remove(player.battle)
            self.players.remove(player)
            self.log.info("Player disconnected", str(player_token))
        finally:
            LOCK.release()

    def search_opponent(self, data):
        """Search opponents for battle.
        
        Search starts every time player send appropriate message.
        Every time search is started new world generates. That means
        that different battles can have the same world's params.
        If amount of players < 2 than search stops.      

        When search starts flag 'player.is_ready_for_battle' sets True.
        After that search gets two players with 
        'is_ready_for_battle' == True and creates battle for them.
        If no more free players search stops.
        """
        try:
            LOCK.acquire()
            self.log.info("Opponent search started")

            self.get_player_by_token(data['token'])\
                .is_ready_for_battle = True

            world = World()
            amount_of_players = len(self.players)
            self.log.info("Amount of players:", str(amount_of_players))

            if amount_of_players < 2:
                self.log.info("Not enough players.")
                return False
            
            player_generator = self.get_player_ready_for_battle()

            while True:
                try:
                    player1 = next(player_generator)
                    player2 = next(player_generator)
                except StopIteration:
                    self.log.info("Search stopped. No more free players.")
                    break

                try:
                    battle = Battle(player1, player2, world)
                except Exception as e:
                    self.log.error(
                        e, 
                        None,
                        "Can't create battle!"+type(e).__name__+str(e.args)
                    )

                self.battles.append(battle)
        
                self.log.info(
                    "Found opponents: {} and {}"\
                    .format(player1.id, player2.id)
                )
        except Exception as e:
            self.log.error(
                e, 
                None, 
                "Search opponent. "+type(e).__name__+str(e.args)
            )      
        finally:
            LOCK.release()  
        
    def player_not_ready(self, data):
        self.get_player_by_token(data['token'])\
            .is_ready_for_battle = False

    def manage_battle(self, data):
        """Forwars player's message to his battle."""
        player = self.get_player_by_token(data['token'])
        if(player.battle == None):
            return False

        player.battle.manage_battle(player, data)
        

    def get_player_ready_for_battle(self):
        """Generator yields players that ready for battle."""
        for player in self.players:
            if player.is_ready_for_battle:
                yield player

    def get_player_by_token(self, token):
        """Returns player if found by player.token otherwise False."""
        for player in self.players:
            if player.token == token:
                return player
        return False

    # def get_battle_by_player(self, player_token):
    #     """Returns battle if found by player.token otherwise False."""
    #     for player in self.players:
    #         if player.token == player_token:
    #             return player.battle
    #     return False