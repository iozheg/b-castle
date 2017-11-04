class GameManager{
    constructor(battleButton){
        this.messageHandler = new MessageHandler(
                                this,
                                this.register,
                                this.handleGameEvents,
                                this.initiateGame,
                                this.message
                            );        
        this.loading = new LoadingAnimation(resources["loading"]);
        this.battleButton = battleButton;
        
        this.keyboardControl();
    }

    register(data){
        if(data.result == "registered") {
            gameinfo.status = 2;
            this.battleButton.innerHTML = "Battle!";
            this.battleButton.onclick = () => {
                this.startSearch();
                return false;
            }
        }
    }

    startSearch(){
        gameinfo.plnick = document.getElementById("P1Nick").value;
        this.messageHandler.sendMessage("search");
        gameinfo.status = 3;
        this.loading.show(document.getElementById("helloDialog"));
        this.battleButton.innerHTML = "Stop searching";
        this.battleButton.onclick = function(){
            this.battleButton.innerHTML = "Battle!";
            this.messageHandler.sendMessage("stopsearch");
            this.loading.hide(document.getElementById("helloDialog"));
            this.battleButton.onclick = function(){
                this.startGame();
                return false;
            }
            return false;
        }
    }

    initiateGame(data){
        gameinfo.status = 4;
        gameinfo.opponent_id = data.opponent_id;
        gameinfo.oppnick = data.opponent_nick;
        
        if(data.turn == "yes"){
            gameinfo.you = "player1";
            gameinfo.opponent = "player2";
            gameinfo.turn = true;
        }
        gameinfo.windforce = data.wind_force;
        gameinfo.terrain = JSON.parse(data.terrain);
        this.startGame();
    }

    startGame(){
        this.loading.hide(document.getElementById("helloDialog"));
        
        document.getElementById("helloDialog").style.display = "none";	//hide menu
        document.getElementById("fade").style.display = "none";
        gameState = "running";	//playing - game was started, stop - game wasn't started, pause - game was paused after start by ESC key
        
        this.graphics = new Graphics(
                    document.getElementById("b2dCanvas"), 
                    configuration.scale, 
                    configuration.cameraLimits, 
                    gameinfo.windforce
                );
        this.physics = new Physics(
                    this.graphics.buffer, 
                    configuration.scale, 
                    configuration.maxStrength
                );
        this.ui = new UserInterface(
                    this.graphics.buffer.ctx, 
                    this.graphics.buffer.width, 
                    configuration.scale, 
                    configuration.maxStrength
                );
        this.game = new Game(
                    this,
                    this.graphics,
                    this.physics,
                    configuration.maxStrength
                ); //start game function
        
        

        requestAnimationFrame(gameLoop);
    }

    stopGame(reason){
        if(this.game){
            this.stop();
            this.game = null;
        }
        this.loading.hide(document.getElementById("helloDialog"));
        if(reason == "connection"){ //if reason of game stop - connection with server lost
            this.battleButton.innerHTML = "Reconnect";
            this.battleButton.onclick = function(){
                location.reload();
                return false;
            }
        }
        else{	//if reason - any other
            this.battleButton.innerHTML = "Battle!";
            this.battleButton.onclick = function(){
                this.startGame("send");
                return false;
            }
        }
        document.body.removeChild(
            document.getElementsByClassName("ingamemenu")[0]
        );
        document.getElementById("helloDialog").style.display = "block";
        document.getElementById("fade").style.display = "block";
    }

    // TODO: what is aim of this method?
    message(data){
        if(data.event == "stopgame"){ 	//if connection with opponent is lost
            this.game.notification.show(data.reason, 3000, 2);
            setTimeout(function(){gamemanager.stopGame();}, 3500, 3);
        }
    }

    handleGameEvents(data){
        this.game.handleGameEvents(data);
        if(data.event == "gameover")
            //delay to show text 
            setTimeout(function(){this.stopGame();}, 3500, 3);
    }

    keyboardControl(){
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
        };

        this.shootControl = function(e){
            //if shoot button was pressed and now released than shoot
            if(e.keyCode == 32 && shootButtonPressed){
                shootButtonPressed = false;
                gamemanager.messageHandler.sendMessage(
                            "gamemsg", 
                            "shot", 
                            {
                                "strength":strength, 
                                "angle":players[gameinfo.you].getAngle()
                            }
                        );			
                strength = 0;
            }
        };

        window.addEventListener("keydown", this.control);
        window.addEventListener("keyup", this.shootControl);
    }

    stop(){
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
        var obj = this.physics.world.GetBodyList();
        while(obj){	//destroy all physical bodies
            this.physics.world.DestroyBody(obj);
            obj = obj.GetNext();
        }
        this.graphics.context.clearRect(
            0,0, this.graphics.buffer.width, this.graphics.buffer.height
        );
        this.physics = null;
        window.removeEventListener("keydown", this.control);
        window.removeEventListener("keyup", this.shootControl);
    }

    draw(){
        //draw terrain, physics, notifications, ui in buffer
        this.graphics.buffer.ctx.clearRect(
            0,0,this.graphics.buffer.width, this.graphics.buffer.height
        );
       
        
        this.game.draw();
        this.graphics.draw(this.physics);
        this.ui.draw(translation);
    //    this.physics.draw();
        
        //draw buffer in main context
        this.graphics.context.clearRect(
            0,0,this.graphics.buffer.width, this.graphics.buffer.height
        );
        this.graphics.context.drawImage(this.graphics.buffer, 0, 0);
    }
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
        gamemanager.physics.world.DestroyBody(obj.body);
        delete obj;
    }
    
    gamemanager.physics.step(dt);
    gamemanager.game.lastFrame = tm;
    gamemanager.draw();
};