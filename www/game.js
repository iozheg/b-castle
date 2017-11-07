class Game{
    constructor(gameManager, graphics, physics, maxStrength){
        this.lastFrame = new Date().getTime();
        this.gameManager = gameManager;
        
        this.shot;
        this.turnStartTime = new Date().getTime()/1000;
        this.elapsedTurnTime = 0;
        this.timeCounterIsActive = true;	// When player shooted stop turn timer. This will prevent game's next turn
        
        this.graphics = graphics
        this.physics = physics;

        this.isShotMade = false;
        
        // Create ground
        new Body(
            this.physics, 
            { type: "static", x: 0, y:35.5, height: 0.5, width: 220 }
        );
          
        this.terrain = new Terrain(this.graphics.buffer.ctx);
                  
        players["player1"] = new Player(
                        this.physics, 
                        "player1", 
                        (
                            gameinfo.you == "player1" 
                            ? (gameinfo.plnick || "you") 
                            : (gameinfo.oppnick || "opponent")
                        )
                    );
        players["player2"] = new Player(
                        this.physics, 
                        "player2", 
                        (
                            gameinfo.you == "player2" 
                            ? (gameinfo.plnick || "you") 
                            : (gameinfo.oppnick || "opponent")
                        )
                    );
        
        this.physics.collision();
        
        this.notification = new SimpleNotification(
                            this, 
                            this.graphics.buffer.ctx, 
                            this.graphics.buffer.width, 
                            this.physics.scale
                        );
        this.notification.show("Game started", 2500, 2);
        
    }

    handleGameEvents(data){
        if(data.event == "aimchange")
            this.setAimPointer(gameinfo.opponent, data.angle);
        else if(data.event == "shot")
            this.shoot(data.player, data.strength, data.angle);
        else if(data.event == "nextturn")
            this.changePlayer(data.player, data.windforce);
        else if(data.event == "hit"){
            this.hitPlayer(data.player, data.damage);
        }
        else if(data.event == "gameover"){			//message "gameover" contains players identity who won this game and reason
            gameinfo.status = 5;
            if(data.player == gameinfo.you) 	//if you won
                if(data.reason == "surrender") 	//if your opponent surrendered
                    this.notification.show(
                        "Your opponent has surrendered", 3000, 2
                    );
                else this.notification.show("You WON!", 3000, 3);
            else if(data.player == gameinfo.opponent) 	//if your opponent won
                if(data.reason == "surrender") 				//if you surrendered
                    this.notification.show(
                        "You have surrendered", 3000, 2
                    );
                else this.notification.show("You LOSE!", 3000, 3);
                
    //        setTimeout(function(){this.stopGame();}, 3500, 3); 	//delay to show text
        }
    }

    turnEnd(){
        /*send message to the server that turn has ended*/
	    this.gameManager.messageHandler.sendMessage("gamemsg", "nextturn");
    }

    changePlayer(playerIdentity, windforce){
        /* begin new turn and change active player*/
        currentPlayer = playerIdentity;
        
        //set start camera position
        if(currentPlayer == "player1")
            translation = configuration.cameraLimits.left;
        else 
            translation = configuration.cameraLimits.right;

        if(isNaN(translation))
            console.log(translation);
        
        this.turnStartTime = new Date().getTime()/1000; 	// new turn begins
        this.timeCounterIsActive = true;	//activate timer
        this.isShotMade = false; 	//no cannonballs on scene
        gameinfo.windForce = windforce; 	//set wind force
        
        if(gameinfo.you == currentPlayer)
            this.notification.show("Your's turn", 2000, 3);
        else
            this.notification.show("Opponent's turn", 2000, 3);
    }
    
    draw(){
        //draw terrain, physics, notifications, ui in buffer

        this.terrain.draw(this.graphics.buffer.ctx, this.physics.scale);
        this.notification.draw(); 
        
        
        //after shot move camera to cannonball
        if(this.isShotMade){
            var currentPosition = this.shot.getCurrentPosition();
            var startPosition = this.shot.getStartPosition();
            
            //when cannonball is out of horizontal scene borders then we delete it (call contact method)
            if(
                (currentPosition.x * this.physics.scale 
                    > this.graphics.buffer.width - configuration.cameraLimits.right 
                    * this.physics.scale + 30) 
                    || currentPosition.x * this.physics.scale < -30
                )
                {
                this.shot.contact();
                this.isShotMade = false; //remove cannonball, if it is out of screen
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
            if(isNaN(translation))
                console.log(translation);
        } 
    }

    setAimPointer(playerIdentity, angle){
        players[playerIdentity].setAngle(angle);
    }

    shoot(playerIdentity, strength, angle){
        //stop timer after shoot
        this.timeCounterIsActive = false;
        this.isShotMade = true;
        this.shot = new Shoot(this.physics, playerIdentity, strength, angle);
        
        //focus camera the shot
        translation = currentPlayer == "player1" ? configuration.cameraLimits.left - 0.01 : configuration.cameraLimits.right + 0.01;
        if(isNaN(translation))
            console.log(translation);
    }

    hitPlayer(playerIdentity, damage){
        players[playerIdentity].castle.castleHP -= damage;
    }

    
}