class Client:
    def __init__(self, token, websocket):
        self.id = None
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

    def send_message(self, message):
        self.ws.send(message)

    def init_battle(self, battle, opponent, side):
        self.battle = battle
        self.opponent = opponent
        self.side = side
        self.is_ready_for_battle = False