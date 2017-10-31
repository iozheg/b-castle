#!/usr/bin/env python

import json
import datetime
import random
from hashlib import md5
import threading
#from __builtin__ import str
from tornado.websocket import websocket_connect

from battle import Battle
from database import Database
from conf import *

LOCK = threading.RLock()


players = []
games = []

#block = False


class Client:
    def __init__(self, token, websocket):
        players.append(self)
        self.id = players.index(self)
        self.token = token
        self.ws = websocket
        self.side = None
        self.nick = None
        self.is_active = True
        self.is_ready_for_battle = False
        self.opponent = None
        self.battle = None
    
    def initial_state(self):
        self.side = None
        self.is_active = True
        self.is_ready_for_battle = False
        self.opponent = None
        self.battle = None
        
    def __repr__(self):
        return str(self.__dict__)


class ClientHandler:
    def __init__(self):
        self.db = Database()
        self.last_battle_id = 0
        
    def register(self, token, websocket):
        try:
            LOCK.acquire()
            c = Client(token, websocket)
            c.ws.send('{"type":"register", "result":"registered"}')
            print(
                "{}: Registered player with ID {}\n"
                .format(
                    datetime.datetime.now().strftime("%H:%M:%S"),
                    str(c.id)
                )
            )
            self.db.server_log((
                "player", 
                "Registered player with ID {}".format(str(c.id))
            ))
            
        finally:
            LOCK.release()
            
    def remove_player(self, player_token):
        try:
            
            for player in players:
                if player.token == player_token:
                    LOCK.acquire()
                    if player.battle:
                        player.battle.unexpected_game_end(player)
                        player.opponent.initial_state()
                        games.remove(player.battle)
                    players.remove(player)
                    print(
                        "{}: player {} disconnected\n"
                        .format(
                            datetime.datetime.now().strftime("%H:%M:%S"),
                            str(player_token)
                        )
                    )
                    self.db.server_log((
                        "player", 
                        "player {} disconnected".format(
                                                    str(player_token)
                                                )
                    ))
                    break
        finally:
            LOCK.release()
    
    def search_opponent(self, players, games): 
        try:
            LOCK.acquire()
            ##TEST FOR PLAYER? OR WEBSOCKET IS GOOD FOR AUTH?
            print(
                "{}: Opponent search started\n"
                .format(datetime.datetime.now().strftime("%H:%M:%S"))
            )
            self.db.server_log(("game", "Opponent search started"))

            amount_of_players = len(players)
            print(
                "{}: Amount of players: {}\n"
                .format(
                    datetime.datetime.now().strftime("%H:%M:%S"), 
                    str(amount_of_players)
                )
            )
            self.db.server_log((
                "game", 
                "Amount of players: {}".format(str(amount_of_players))
            ))
            if amount_of_players >= 2: 
                terrain = generate_terrain()    # Terrain is generated every cycle of search, and not for every game. It gives less load for a server. 
                wind_force = round(rand(MINWINDFORCE, MAXWINDFORCE), 1)     # The same as terrain: start wind force generated every search cycle.
                str_terr = json.dumps(terrain)
                i1 = 0
                while i1 < (amount_of_players-1):
                    if players[i1].is_ready_for_battle:
                        i2= i1 + 1
                        while i2 < amount_of_players:
                            if players[i2].is_ready_for_battle:
                                
                                short_terrain = terrain[::3]
                                battle_id = md5(str(short_terrain).encode('utf-8')).hexdigest()
                                game = Battle(battle_id, self.db, players[i1], players[i2], terrain)
                                games.append(game)
                               
                                self.db.add_battle((
                                    battle_id, 
                                    players[i1].nick, 
                                    players[i2].nick, 
                                    ",".join(str(x) for x in short_terrain) 
                                ))

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
                                self.db.server_log((
                                    "game", 
                                    " Found opponents: {} and {}, battle ID: {}"
                                    .format(str(i1), str(i2), str(battle_id)) 
                                ))
                                break
                            i2 += 1
                    i1 += 1
        finally:
            LOCK.release()  
            
    def message_handler(self, data, websocket):
        
        ''' Handling incoming messages. '''
        
        decoded_data = json.loads(data)
        
        try:
            type = decoded_data['type']
            token = decoded_data['token']
            
            if type == "register" and token:
                self.register(token, websocket)
                
            elif type == "search" and token:    
                           
                for player in players:
                    if player.token == token:
                        player.is_ready_for_battle = True
                        player.nick = decoded_data["nick"]
                        
                        self.search_opponent(players, games)
                        break
                    
            elif type == "stopsearch" and token:
                for player in players:
                    if player.token == token:
                        player.is_ready_for_battle = False
                        break    
                    
            elif type == "gamemsg" and token:
                for player in players:
                    
                    if player.token == token:
                        if player.opponent is None or player.battle is None:
                            player.ws.send(
                                '{"type":"errmsg", "data":"you have no active game"}'
                            )
                            
                        elif decoded_data['event'] == "nextturn":
                            player.battle.next_turn(player)

                        elif decoded_data['event'] == "turntimeover":
                            player.battle.check_turn_duration()
                            
                        elif decoded_data['event'] == "surrender":
                            player.battle.game_over(player.opponent.side, "surrender")

                        elif player.battle.turn != player:
                            player.ws.send('{"type":"errmsg", "data":"not your turn"}')
                        else:
                            if decoded_data['event'] == "shot" and is_number(decoded_data["angle"]):
                                player.battle.shot(player, decoded_data)
                              
                            elif decoded_data['event'] == "aimchange" and is_number(decoded_data["angle"]):
                                player.battle.aimchange(player, decoded_data)
                                
                            elif decoded_data['event'] == "hit":
                               player.battle.hit(player, decoded_data)
                        
                        break
            #print "DONE"
        except KeyError as e:
            print("Key Error: " + str(e))
        


def rand(minv, maxv):
    """generate random value between minv and maxv"""
    
    return random.random() * (maxv - minv) + minv

def is_number(x):
    try:
        float(x)
        return True
    except ValueError:
        return False 

    
def generate_terrain():
    width = 1800
    height = 700
    k = 0.8
    terrain = [0 for _ in range(width)]

    def mdp(res, indexH1, indexH2, k, height):
        """midpoint displacement. generate terrain line"""
        
        length = indexH2 - indexH1
        if (length <= 1):
            return
        index = int((indexH1 + indexH2)/2)
        res[index] = abs(round((res[indexH1] + res[indexH2]) / 2 + rand(-1 * k * length, k * length)))
        mdp(res, indexH1, index, k, height)
        mdp(res, index, indexH2, k, height)
        
    terrain[0] = terrain[-1] = 1
    mdp(terrain, 0, width-1, k, height)

    #normalize values. they must be from 0 to height
    maxv = 0
    for point in terrain:
        if(maxv < point):
            maxv = point
    if(maxv > height):
        k = height / maxv
        for i in range(width):
            terrain[i] *= k

    #smoothing
   # for i in range(width-2):
   #     terrain[i+1] = int((terrain[i] + terrain[i+2])/2)
    #make terrain "pixelized"
    for i in range(0, width-1, 3):
        terrain[i] = terrain[i+1] = terrain[i+2] = int(terrain[i])
        
    return terrain
