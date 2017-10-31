#!/usr/bin/env python

import tornado.ioloop
import tornado.web
import tornado.websocket
import threading
import datetime
import os

from tornado.options import define, options, parse_command_line

import clienthandler

define("port", default=8888, help="run on the given port", type=int)



# we gonna store clients in dictionary..
clients = dict()

class IndexHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        self.finish()

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self, *args):
        self.id = self.get_argument("id")
        self.stream.set_nodelay(True)
        clients[self.id] = {"id": self.id, "object": self}
        
     #   print "_".join(_ for _ in clients)
##        message = "Connected ids: "
##        for i in clients:
##            message += str(clients[i]["id"]) + " \n"
##        self.write_message(message);

    def on_message(self, message):        
        """
        when we receive some message we want some message handler..
        for this example i will just print message to console
        """
        print(
            "{}: Receiving message from {}: {}\n" 
            .format(
                datetime.datetime.now().strftime("%H:%M:%S"), 
                self.id, 
                message
            )
        )
        ch.db.server_log((
            "system", 
            "Receiving message from {}: {}".format(self.id, message)
        ))
        thread = threading.Thread(
            target=ch.message_handler, 
            args=[message, self]
        )
        thread.start()
    def send(self, data):
        try:
            print(
                "{}: Sending message to {}: {}\n" 
                .format(
                    datetime.datetime.now().strftime("%H:%M:%S"), 
                    self.id, 
                    data
                )
            )
        #    ch.db.server_log(("system", "Sending message to %s: %s" % (self.id, data)))
            self.write_message(data)
        except tornado.websocket.WebSocketClosedError:
            ch.remove_player(self.id)
            print('Websocket is closed: delete player')
        #    ch.db.server_log(("system", "Websocket is closed: delete player"))
        except tornado.websocket.WebSocketError:
            print ('Something gone wrong...')
            ch.db.server_log((
                "system", 
                "Something gone wrong with WebSocket"
            ))
    def on_close(self):
        print ("player {} closed connection".format(self.id))
        ch.db.server_log((
            "system", 
            "player {} closed connection".format(self.id)
        ))
        if self.id in clients:
            del clients[self.id]
            ch.remove_player(self.id)
            
    def check_origin(self, origin):
        return True

app = tornado.web.Application([
    (r'/', IndexHandler),
    (r'/ws', WebSocketHandler),
])

if __name__ == '__main__':
    ch = clienthandler.ClientHandler()

    parse_command_line()
    app.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
