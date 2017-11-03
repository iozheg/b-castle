var UserInterface = function(context, width, scale, maxStrength){
	this.context = context;
	this.width = width;
	this.scale = scale;
	this.maxStrength = maxStrength;
	
	//menu in game
	var inGameMenu = document.createElement("div");
	var menuButton = document.createElement("button");
	var menuBackButton = document.createElement("button");
	var surrenderButton = document.createElement("button");
	
	menuButton.innerHTML = "Menu";
	menuButton.className = "menu_button";
	inGameMenu.className = "ingamemenu";
	inGameMenu.appendChild(menuButton);
	menuBackButton.innerHTML = "Back";
	surrenderButton.innerHTML = "Surrender";
	document.body.appendChild(inGameMenu);
	
	menuButton.onclick = function(){
		menuButton.style.display = "none";
		inGameMenu.appendChild(surrenderButton);
		inGameMenu.appendChild(menuBackButton);
	}
	
	menuBackButton.onclick = function(){
		inGameMenu.removeChild(surrenderButton);
		inGameMenu.removeChild(menuBackButton);
		menuButton.style.display = "block";
	}
	
	surrenderButton.onclick = function(){
		conn.send("gamemsg", "surrender");
	}
}

UserInterface.prototype.draw = function(translation){
	var identities = ["player1", "player2"];

	for(var i = 0; i < 2; i++){
		var position = players[identities[i]].getCastlePosition();
		
		this.context.save();
		
		this.context.translate((position.x + translation) * this.scale, position.y * this.scale);
		
		//your nick is red
		if(gameinfo.you == players[identities[i]].identity)
			this.context.fillStyle="#FF0000";
		else
			this.context.fillStyle="#000000";
		
		var castleHP = players[identities[i]].castle.castleHP;
		
		this.context.font="10px 'Press Start 2P'";
		this.context.fillText(players[identities[i]].nick, -40, -70);	//show nick
		this.context.scale(this.scale, this.scale);
		this.context.fillStyle="#00FF00";
		this.context.fillRect(-2, -3, 4*castleHP/100, 0.2);	//show remaining HP (green)
		this.context.fillStyle="#FF0000";
		this.context.fillRect(-2+4*castleHP/100, -3, 4*(1-castleHP/100), 0.2); //show damage (red)
		
		//current player has indicator of shoot strength (when holding shoot button)
		if(currentPlayer == players[identities[i]].identity){
			this.context.fillStyle="#dddddd";
			this.context.fillRect(-2, -2.7, 4*(window.strength)/this.maxStrength, 0.2);
		}
		
		this.context.restore();
		this.context.save();
		
		//show timer
		var timeLefted = 30 - gamemanager.game.elapsedTurnTime>>0;
		if(timeLefted < 0)
			timeLefted = 0;
		this.context.font="36px 'Press Start 2P'";
		if(timeLefted > 5)
			this.context.fillStyle="black";
		else
			this.context.fillStyle="#FF0000"; //if less than 5 sec then timer is red
		this.context.fillText(timeLefted, (this.width+40) / 2, this.scale*2); // 40 - offset in pixels to center timer
		
		this.context.restore();
	}
}