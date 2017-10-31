var MessageHandler = function(gameinfo, errorMessageDiv){
	this.gameinfo = gameinfo;
	this.errorMessageDiv = errorMessageDiv;
}

MessageHandler.prototype.handleMessage = function(rawMessage){
	var parsedMessage = $.parseJSON(rawMessage.data);
	
	switch (parsedMessage.type){
		case "register":
			if(parsedMessage.result == "registered") {
				this.gameinfo.status = 2;
				b = document.getElementById("battle_button");
				b.innerHTML = "Battle!";
				b.onclick = function(){
					startgame("send");
					return false;
				}
			}
			break;
			
		case "search":
			this.gameinfo.status = 4;
			this.gameinfo.opponent_id = parsedMessage.opponent_id;
			this.gameinfo.oppnick = parsedMessage.opponent_nick;
			
			if(parsedMessage.turn == "yes"){
				this.gameinfo.you = "player1";
				this.gameinfo.opponent = "player2";
				this.gameinfo.turn = true;
			}
			this.gameinfo.windforce = parsedMessage.windforce;
			this.gameinfo.terrain = $.parseJSON(parsedMessage.terrain);
			startgame('start');
			break;
			
		case "errmsg":
		//	for future features
			break;
			
		case "gamemsg":
			if(parsedMessage.event == "aimchange")
				game.setAimPointer(this.gameinfo.opponent, parsedMessage.angle);
			else if(parsedMessage.event == "shot")
				game.shoot(parsedMessage.player, parsedMessage.strength, parsedMessage.angle);
			else if(parsedMessage.event == "nextturn")
				game.changePlayer(parsedMessage.player, parsedMessage.windforce);
			else if(parsedMessage.event == "hit"){
				game.hitPlayer(parsedMessage.player, parsedMessage.damage);
			}
			else if(parsedMessage.event == "gameover"){			//message "gameover" contains players identity who won this game and reason
				this.gameinfo.status = 5;
				if(parsedMessage.player == this.gameinfo.you) 	//if you won
					if(parsedMessage.reason == "surrender") 	//if your opponent surrendered
						game.notification.show("Your opponent has surrendered", 3000, 2);
					else game.notification.show("You WON!", 3000, 3);
				else if(parsedMessage.player == this.gameinfo.opponent) 	//if your opponent won
					if(parsedMessage.reason == "surrender") 				//if you surrendered
						game.notification.show("You have surrendered", 3000, 2);
					else game.notification.show("You LOSE!", 3000, 3);
					
				setTimeout(function(){stopgame();}, 3500, 3); 	//delay to show text
			}
			break;
			
		case "message":
			if(parsedMessage.event == "stopgame"){ 	//if connection with opponent is lost
				game.notification.show(parsedMessage.reason, 3000, 2);
				setTimeout(function(){stopgame();}, 3500, 3);
			}
	}
}

MessageHandler.prototype.handleError = function(error, readyState){
// for future

	var div = document.createElement("div");
	div.innerHTML = "<font style=\"font-size: 10px;\">No connection to server</font>";
	div.style.width = "100%";
	div.style.textAlign = "center";
	this.errorMessageDiv.appendChild(div);
	this.gameinfo.status = 6;
	stopgame("connection");
}

MessageHandler.prototype.handleConnectionLost = function(){
	var div = document.createElement("div");
	div.innerHTML = "<font style=\"font-size: 10px;\">No connection to server</font>";
	div.style.width = "100%";
	div.style.textAlign = "center";
	this.errorMessageDiv.appendChild(div);
	this.gameinfo.status = 6;
	stopgame("connection");
}

MessageHandler.prototype.handleConnectionSuccess = function(){
	
}