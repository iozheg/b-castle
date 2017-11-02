class Client:
    """Represents player.

    Attributes:
        id (int): Player's id in list of players.
        token (str): Unique websocket's id.
        ws (:obj:`WebSocketHandler`): Reference to websocket object.
        side (str): 'player1' or 'player2'. Helpful flags when battle.
        nick (str): Player's nick. Default: equal side.
        is_ready_for_battle (bool): Flag that shows whether player
            search for battle.
        opponent (:obj:`Client`): Reference to the opponent object. 
            Matters only in battle.
        battle (:obj:`Battle`): Reference to battle objectin which
            player takes part.
    """
    
    def __init__(self, token, websocket):
        self.id = None
        self.token = token
        self.ws = websocket
        self.side = None
        self.nick = ""
        self.is_active = True
        self.is_ready_for_battle = False
        self.opponent = None
        self.battle = None
    
    def initial_state(self):
        """Return player to initial state after battle."""
        self.side = None
        self.is_active = True
        self.is_ready_for_battle = False
        self.opponent = None
        self.battle = None

    def register(self, id):
        """Notify player after registration."""
        self.id = id
        self.send_message(
            '{"type":"register", "result":"registered"}'
        )

    def init_battle(self, battle, opponent, side):
        """Prepare player to battle.
       
        After creating battle notify player. Send him opponent id and
        nick, start wind force,terrain array, turn flag.
        'player1' always makes first move. If current player side ==
        'player1' than turn='yes' and he makes first move.
        """
        self.battle = battle
        self.opponent = opponent
        self.side = side
        turn = "yes" if self.side == "player1" else "no"
        self.is_ready_for_battle = False

        self.send_message(
            '{{"type":"search", "opponent_id":{0}, \
            "opponent_nick":"{1}", "turn":"{2}", "wind_force":"{3}", \
            "terrain":"{4}"}}'
            .format(
                self.opponent.id, 
                self.opponent.nick, 
                turn,
                self.battle.wind_force, 
                self.battle.terrain
            )
        )

    
    def send_message(self, message):
        """Send message via websocket."""
        self.ws.send(message)