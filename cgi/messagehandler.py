class MessageHandler:
    
    # handlers is dict of types and it handler callbacks.
    # Callbacks belong to Game class
    # Format: {type: callback}
    # Possible message's types:
    # 1. register
    # 2. search
    # 3. stopsearch
    # 4. gamemsg
    handlers = dict()

    def __init__(self, handlers):
        self.handlers = handlers

    def process_message(self, message):
        
        try:
            decoded_data = json.loads(data)
        except e:
            return False #logger action
        
        try:
            type = decoded_data['type']
        except KeyError as e:
            return False #logger action

        try:
            self.handlers[type](decoded_data)
        except KeyError as e:
            return False #logger action

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
    