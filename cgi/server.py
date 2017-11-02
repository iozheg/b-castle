#!/usr/bin/env python

import tornado.ioloop
import tornado.web
import tornado.websocket
import threading
from datetime import datetime
import os

from tornado.options import define, options, parse_command_line

from game import Game
from logger import Logger

define("port", default=8888, help="run on the given port", type=int)



# we gonna store clients in dictionary..
clients = dict()
# logger
log = Logger()

class IndexHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        self.finish()

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self, *args):
        self.id = self.get_argument("id")
        self.stream.set_nodelay(True)
        clients[self.id] = {"id": self.id, "object": self}

    def on_message(self, message):        
        """Incoming messages handler.
        
        For received message create new thread.
        """
        log.received_message(self.id, message)

        thread = threading.Thread(
            target=game.handle_message, 
            args=[message, self]
        )
        thread.start()
    def send(self, data):
        try:
            self.write_message(data)
            log.sent_message(self.id, data)
        except tornado.websocket.WebSocketClosedError:
            game.remove_player(self.id)
            log.error(
                tornado.websocket.WebSocketClosedError,
                self_id,
                "Can't send message: connection closed"
            )
        except tornado.websocket.WebSocketError:
            game.remove_player(self.id)
            log.error(
                tornado.websocket.WebSocketError,
                self.id
            )
    def on_close(self):
        if self.id in clients:
            del clients[self.id]
            game.remove_player(self.id)
            log.ws_closed(self.id)
            
    def check_origin(self, origin):
        """Skip CORS check (cross domain)."""
        return True

app = tornado.web.Application([
    (r'/', IndexHandler),
    (r'/ws', WebSocketHandler),
])

if __name__ == '__main__':
    game = Game()

    parse_command_line()
    app.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
