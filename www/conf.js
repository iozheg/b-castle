var configuration = {
	scale: 20,
	cameraLimits : {
		left: 0,
		right: -30
	},
	
	maxStrength: 30,	//max strength of shot
	gameSceneWidth: 2100
}
var gameinfoInitial = {
	rId: 0,
	opponent_id: null,
	opponent: "player1",
	you: "player2",	//who is the leading player of game. 1 - you, 0 - opponent. Leading player has left position.
	turn: false,		//whose turn. 1 - your, 0 - opponent's
	yourAimpointerAngle: 0,
	opponentAimpointerAngle: 0,
	windforce: 0,
	terrain: 0,
	status: 0
}

function resetGameinfo(gameinfo){
	gameinfo.rId = 0;
	gameinfo.opponent_id = null;
	gameinfo.opponent = "player1";
	gameinfo.you = "player2";
	gameinfo.turn = false;
	gameinfo.yourAimpointerAngle = 0,
	gameinfo.opponentAimpointerAngle = 0,
	gameinfo.windforce = 0,
	gameinfo.terrain = 0,
	gameinfo.status = 0
}