var Game = function(canvas, scale, cameraLimits, maxStrength){

	this.lastFrame = new Date().getTime();
	this.canvas = canvas;
	this.context = this.canvas.getContext("2d");
	this.buffer = document.createElement("canvas"); //for buffering
	this.buffer.ctx = this.buffer.getContext("2d");
	this.buffer.width = parseInt((this.canvas.currentStyle || window.getComputedStyle(this.canvas)).width);
	this.buffer.height = parseInt((this.canvas.currentStyle || window.getComputedStyle(this.canvas)).height);
	this.shot;
	this.turnStartTime = new Date().getTime()/1000;
	this.elapsedTurnTime = 0;
	this.timeCounterIsActive = true;	// When player shooted stop turn timer. This will prevent game's next turn
	
	this.physics = new Physics(this.buffer, scale, maxStrength, gameinfo.windforce);
	
	// Create ground
	new Body(this.physics, { type: "static", x: 0, y:35.5, height: 0.5, width: 220 });
      
	this.terrain = new Terrain(this.buffer.ctx);
	this.ui = new UserInterface(this.buffer.ctx, this.buffer.width, scale, maxStrength);
	  
	players["player1"] = new Player(this.physics, "player1", (gameinfo.you == "player1" ? (gameinfo.plnick || "you") : (gameinfo.oppnick || "opponent")));
	players["player2"] = new Player(this.physics, "player2", (gameinfo.you == "player2" ? (gameinfo.plnick || "you") : (gameinfo.oppnick || "opponent")));
	
	this.control();
	this.physics.collision();
	
	this.notification = new SimpleNotification(this, this.buffer.ctx, this.buffer.width, scale);
	this.notification.show("Game started", 2500, 2);
	
	requestAnimationFrame(gameLoop);
}

Game.prototype.turnEnd = function(){
	/*send message to the server that turn has ended*/
	gamemanager.messageHandler.sendMessage("gamemsg", "nextturn");
}

Game.prototype.changePlayer = function (playerIdentity, windforce){
	/* begin new turn and change active player*/
	currentPlayer = playerIdentity;
	
	//set start camera position
	if(currentPlayer == "player1")
		translation = configuration.cameraLimits.left;
	else 
		translation = configuration.cameraLimits.right;
	
	this.turnStartTime = new Date().getTime()/1000; 	// new turn begins
	this.timeCounterIsActive = true;	//activate timer
	Cannonball.isOnScene = false; 	//no cannonballs on scene
	this.physics.wind.force = windforce; 	//set wind force
	
	if(gameinfo.you == currentPlayer)
		this.notification.show("Your's turn", 2000, 3);
	else
		this.notification.show("Opponent's turn", 2000, 3);
}

Game.prototype.draw = function(){
	//draw terrain, physics, notifications, ui in buffer
	this.buffer.ctx.clearRect(0,0,this.buffer.width, this.buffer.height);
	this.terrain.draw(this.buffer.ctx, this.physics.scale);
	this.physics.draw();
	this.notification.draw();
	this.ui.draw(translation);
	
	//draw buffer in main context
	this.context.clearRect(0,0,this.buffer.width, this.buffer.height);
	this.context.drawImage(this.buffer, 0, 0);

	//after shot move camera to cannonball
	if(Cannonball.isOnScene){
		var currentPosition = this.shot.getCurrentPosition();
		var startPosition = this.shot.getStartPosition();
		
		//when cannonball is out of horizontal scene borders then we delete it (call contact method)
		if((currentPosition.x * this.physics.scale > this.buffer.width - configuration.cameraLimits.right * this.physics.scale + 30) || currentPosition.x * this.physics.scale < -30){
			this.shot.contact();
			Cannonball.isOnScene = false; //remove cannonball, if it is out of screen
		}
		
		/*
			because cannonballs can fly right or left we move camera right or left
			also we must control camera translation (it must not be out of scene borders)
		*/
		if(currentPlayer == "player1"){		//camera is moving to the left
			translation = translation > configuration.cameraLimits.right ? configuration.cameraLimits.left + (startPosition.x - currentPosition.x) : configuration.cameraLimits.right;
			if(translation > configuration.cameraLimits.left)
				translation = configuration.cameraLimits.left;
		}
		else {		//camera is moving to right border
			translation = translation < configuration.cameraLimits.left ? configuration.cameraLimits.right + (startPosition.x - currentPosition.x) : configuration.cameraLimits.left;
			if(translation < configuration.cameraLimits.right)
				translation = configuration.cameraLimits.right;
		} 
	} 
}

Game.prototype.setAimPointer = function(playerIdentity, angle){
	
	players[playerIdentity].setAngle(angle);
}

Game.prototype.shoot = function(playerIdentity, strength, angle){
	gamemanager.game.timeCounterIsActive = false;	//stop timer after shoot
	this.shot = new Shoot(this.physics, playerIdentity, strength, angle);
	
	//focus camera the shot
	translation = currentPlayer == "player1" ? configuration.cameraLimits.left - 0.01 : configuration.cameraLimits.right + 0.01;
}

Game.prototype.hitPlayer = function(playerIdentity, damage){
	players[playerIdentity].castle.castleHP -= damage;
}

Game.prototype.control = function(){
	this.control = function(e){
		var angle;
		switch (e.keyCode) {
			case 32:
				//you can shoot if you is active player and there was no shots in current turn
				if(!Cannonball.isOnScene && (gameinfo.you == currentPlayer)){
					shootButtonPressed = true; //player can hold shoot button to increase shoot strength
				}
				break;
			case 38:
				//you can move aim pointer up or down only if you are active player
				if(gameinfo.you != currentPlayer)
					break;
				if(!players[gameinfo.you].angle.upperBound(players[gameinfo.you].getAngle())) //if current angle greater max value than set angle to max value
					angle = players[gameinfo.you].angle.max;
				else
					angle = players[gameinfo.you].getAngle() - players[gameinfo.you].angle.increment_sign * 0.02;
				
				gamemanager.messageHandler.sendMessage("gamemsg", "aimchange", {"angle":angle});
				gamemanager.game.setAimPointer(gameinfo.you, angle);
				break;
			case 40:
				if(gameinfo.you != currentPlayer)
					break;
				if(!players[gameinfo.you].angle.lowerBound(players[gameinfo.you].getAngle()))	//if current angle less min value than set angle to min value
					angle = players[gameinfo.you].angle.min;
				else
					angle = players[gameinfo.you].getAngle() + players[gameinfo.you].angle.increment_sign * 0.02;
				
				gamemanager.messageHandler.sendMessage("gamemsg", "aimchange", {"angle": + angle});
				gamemanager.game.setAimPointer(gameinfo.you, angle);
				break;
			case 37:
				translation += 1;
				if(translation > configuration.cameraLimits.left)
					translation = configuration.cameraLimits.left;
				break;
			case 39:
				translation -= 1;
				if(translation < configuration.cameraLimits.right)
					translation = configuration.cameraLimits.right;
				break;
		}
	}
	this.shootControl = function(e){
		if(e.keyCode == 32 && shootButtonPressed){ //if shoot button was pressed and now released than shoot
			shootButtonPressed = false;
			gamemanager.messageHandler.sendMessage("gamemsg", "shot", {"strength":strength, "angle":players[gameinfo.you].getAngle()});
			
			strength = 0;
		}
	}

	window.addEventListener("keydown", this.control);
	window.addEventListener("keyup", this.shootControl);
}

Game.prototype.stop = function(){
	gameState = "stop";
	players = [];
	currentPlayer = "player1";
	resetGameinfo(gameinfo); //reset parameters to initial
	bodiesForRemove = [];
	animations = [];
	translation = 0;
	strength = 0;
	shootButtonPressed = false;
	Cannonball.isOnScene = false;
	var obj = gamemanager.game.physics.world.GetBodyList();
	while(obj){	//destroy all physical bodies
		gamemanager.game.physics.world.DestroyBody(obj);
		obj = obj.GetNext();
	}
	this.context.clearRect(0,0, this.buffer.width, this.buffer.height);
	this.physics = null;
	window.removeEventListener("keydown", this.control);
	window.removeEventListener("keyup", this.shootControl);
}

window.gameLoop = function() {
		//main game loop
		if(gameState == "stop")
			return;
		var tm = new Date().getTime();
		
		if(gamemanager.game.timeCounterIsActive)
			gamemanager.game.elapsedTurnTime = tm/1000 - gamemanager.game.turnStartTime;
		if(gamemanager.game.elapsedTurnTime >= 30){	// check turn timeover
			gamemanager.messageHandler.sendMessage("gamemsg", "turntimeover");
		}
			
		requestAnimationFrame(gameLoop);
		var dt = (tm - gamemanager.game.lastFrame) / 1000;
		if(dt > 1/15) { dt = 1/15; }
		
		//every frame delete objects that was destroyed
		while((obj = bodiesForRemove.pop())){
			gamemanager.game.physics.world.DestroyBody(obj.body);
			delete obj;
		}
		
		gamemanager.game.physics.step(dt);
		gamemanager.game.lastFrame = tm;
		gamemanager.game.draw();
	};