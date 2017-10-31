var MyWebSocket = function(url, _gameinfo, errorMessageDiv){
	new WebSocket.call(this, url);
	this.gameinfo = _gameinfo;
	this.errorMessageDiv = errorMessageDiv;
}

MyWebSocket.prototype = Object.create(WebSocket.prototype);

MyWebSocket.prototype.handleMessage = function(rawMessage){
	var parsedMessage = $.parseJSON(rawMessage.data);
	//	log(e.data);
	switch (parsedMessage.type){
		case "register":
			if(parsedMessage.result == "registered") 
				this.gameinfo.status = 2
			log(parsedMessage.result);
			break;
		case "search":
			this.gameinfo.status = 4;
			log("battle " + parsedMessage.opponent_id);
			this.gameinfo.opponent_id = parsedMessage.opponent_id;
			if(parsedMessage.turn == "yes"){
				this.gameinfo.side = "player1";
				this.gameinfo.opponent = "player2";
				this.gameinfo.turn = true;
			}
			this.gameinfo.windforce = parsedMessage.windforce;
			this.gameinfo.terrain = $.parseJSON(parsedMessage.terrain);
			startgame('start');
		//	s.send(unescape(encodeURIComponent('{"token" : "' + rId + '", "type" : "gamemsg", "event":"shot", "data" : "here is battle data ' + rId + '"}')))
			break;
		case "errmsg":
			log(parsedMessage.data);
			break;
		case "gamemsg":
			if(parsedMessage.event == "aimchange")
				game.setAimPointer(this.gameinfo.opponent, parsedMessage.angle);
			else if(parsedMessage.event == "shot")
				game.shoot(parsedMessage.player, parsedMessage.strength, parsedMessage.angle);
			else if(parsedMessage.event == "nextturn")
				game.changePlayer(parsedMessage.player, parsedMessage.windforce);
			else if(parsedMessage.event == "hit"){
				log("hit " + parsedMessage.player);
				game.hitPlayer(parsedMessage.player, parsedMessage.damage);
			}
			else if(parsedMessage.event == "gameover"){
				this.gameinfo.status = 5;
				if(parsedMessage.player == this.gameinfo.side)
					alert("You WON!");
				else if(parsedMessage.player == this.gameinfo.opponent)
					alert("You LOSE!");
			}
		//	alert(parsedMessage.event + " data " + parsedMessage.data);
			break;
		case "message":
			if(parsedMessage.event == "stopgame"){
				alert(parsedMessage.reason);
				stopgame();
			}
	}
}

MyWebSocket.prototype.handleError = function(error, readyState){
	log("error " + error + " " + error.type + " ws.readyState: " + readyState);
	var div = document.createElement("div");
	div.innerHTML = "No connection to server";
	div.style.width = "100%";
	div.style.textAlign = "center";
	this.errorMessageDiv.appendChild(div);
	this.gameinfo.status = 6;
	stopgame();
}

MyWebSocket.prototype.handleConnectionLost = function(){
	alert("Connection with server is lost");
	this.gameinfo.status = 6;
	stopgame();
}