#!/usr/bin/env python

def search_engine(players, games):
    amount_of_players = len(players)
    print amount_of_players
    if amount_of_players >= 2:
        i1 = 0
        while i1 < (amount_of_players-1):
            #print i1
            if players[i1].opponent_id is None:
                i2= i1 + 1
                while i2 < amount_of_players:
                    #print i2
                    if players[i2].opponent_id is None:
                        players[i1].opponent_id = i2
                        players[i2].opponent_id = i1
                        players[i1].ws.send('{"opponent_id":"' + str(i2) +  '"}')
                        players[i2].ws.send('{"opponent_id":"' + str(i1) +  '"}')
                        games.append(Game(players[i1], players[i2]))
                        print "found opponents: " + str(i1) + " and " + str(i2)
                        break
                    i2 += 1
            i1 += 1
