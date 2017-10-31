from datetime import datetime

class Logger():
    
    def add_datetime(func):
        def wrapper(self, *args, **kwargs):
            print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), end=" ")
            return func(self, *args, **kwargs)
        return wrapper

    @add_datetime
    def received_message(self, client_id, message):
        print("Message from {}: {}\n". format(client_id, message))

    @add_datetime
    def sent_message(self, client_id, message):
        print("Message to {}: {}\n". format(client_id, message))

    @add_datetime
    def ws_closed(self, client_id):
        print("Websocket is closed: delete player " + client_id)

    @add_datetime
    def error(self, error=None, client_id=None, message=""):
        print("ERROR: {} client: {} {}".format(error, client_id, message))
        