class Game{
    constructor(
            context, 
            physics, 
            terrainLine, 
            windForce
        )
    {
        this.lastFrame = new Date().getTime();
        
        this.shot;
        this.turnStartTime = new Date().getTime()/1000;
        this.elapsedTurnTime = 0;
        this.timeCounterIsActive = true;	// When player shooted stop turn timer. This will prevent game's next turn

        this.physics = physics;
        this.windForce = windForce;
        this.isShotMade = false;
        
        // Create ground
        new Body(
            this.physics, 
            { type: "static", x: 0, y:35.5, height: 0.5, width: 220 }
        );
          
        this.terrain = new Terrain(context, terrainLine);
        
        this.physics.collision();
        
    //    this.notification = new SimpleNotification();
    //    this.notification.show("Game started", 2500, 2);
        
    }

    handleGameEvents(data, opponent){
        if(data.event == "aimchange")
            this.setAimPointer(opponent, data.angle);
        else if(data.event == "shot")
            this.shoot(data.player, data.strength, data.angle);
        else if(data.event == "nextturn"){
            this.changePlayer(data.player);            
            this.windForce = data.wind_force;
        }
        else if(data.event == "hit"){
            this.hitPlayer(data.player, data.damage);
        }
    }

    turnEnd(){
        /*send message to the server that turn has ended*/
	    gamemanager.messageHandler.sendMessage("gamemsg", "nextturn");
    }

    changePlayer(playerIdentity){
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
    }
    
    draw(context, width, scale){
        //draw terrain, physics, notifications, ui in buffer

        this.terrain.draw(context, scale);      
        
        //after shot move camera to cannonball
        if(this.isShotMade){
            var currentPosition = this.shot.getCurrentPosition();
            var startPosition = this.shot.getStartPosition();
            
            // When cannonball is out of horizontal scene borders 
            // then we delete it (call contact method).
            if(
                (currentPosition.x * scale 
                    > width 
                        - configuration.cameraLimits.right
                        * scale + 30) 
                    || currentPosition.x * scale < - 30
                )
                {
                this.shot.contact();
                this.isShotMade = false; 
            }
            
            // Because cannonballs can fly right or left 
            // we move camera right or left.
            // Also we must control camera translation 
            // (it must not be out of scene borders).            
            if(currentPlayer == "player1"){		//camera is moving to the left
                translation = translation > configuration.cameraLimits.right
                                ? configuration.cameraLimits.left 
                                    + (startPosition.x - currentPosition.x) 
                                : configuration.cameraLimits.right;
                if(translation > configuration.cameraLimits.left)
                    translation = configuration.cameraLimits.left;
            }
            else {		//camera is moving to right border
                translation = translation < configuration.cameraLimits.left 
                                ? configuration.cameraLimits.right 
                                    + (startPosition.x - currentPosition.x) 
                                : configuration.cameraLimits.left;
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
        this.shot = new Shoot(
                    this.physics, 
                    playerIdentity, 
                    strength, 
                    angle,
                    this.windForce
                );
        
        //focus camera the shot
        translation = currentPlayer == "player1" 
                        ? configuration.cameraLimits.left - 0.01 
                        : configuration.cameraLimits.right + 0.01;
        if(isNaN(translation))
            console.log(translation);
    }

    hitPlayer(playerIdentity, damage){
        players[playerIdentity].hit(damage);
    }

    
}