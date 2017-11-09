class GameManager{
    constructor(camera, canvas, battleButton){
        this.messageHandler = new MessageHandler(
                                this,
                                this.register,
                                this.handleGameEvents,
                                this.initiateGame,
                                this.message
                            );        
        this.loading = new LoadingAnimation(resources["loading"]);
        this.notification = new SimpleNotification();
        this.camera = camera;
        this.canvas = canvas;
        this.battleButton = battleButton;
        
        this.keyboardControl();

        this.terrainLine = [];
        this.windForce = 0;
        this.opponentNick = "";
        this.playerNick = "";
        this.thisPlayer = "";
        this.opponent = "";
        this.firstTurnYours = false;
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
        this.playerNick = document.getElementById("P1Nick").value;
        this.messageHandler.sendMessage(
                            "search", 
                            null, 
                            {nick: this.playerNick}
                        );
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
        this.opponentNick = data.opponent_nick;        
        this.windForce = data.wind_force;
        this.terrainLine = JSON.parse(data.terrain);
        
        if(data.turn == "yes"){
            this.thisPlayer = "player1";
            this.opponent = "player2";
            this.firstTurnYours = true;
        } else {
            this.thisPlayer = "player2";
            this.opponent = "player1";
            this.firstTurnYours = false;
        }

        this.loading.hide(document.getElementById("helloDialog"));        
        document.getElementById("helloDialog").style.display = "none";	//hide menu
        document.getElementById("fade").style.display = "none";

        this.startGame();
    }
    startGame(){        
        gameState = "running";	//playing - game was started, stop - game wasn't started, pause - game was paused after start by ESC key
        
        this.graphics = new Graphics(
                    canvas, 
                    this.camera.scale, 
                    this.camera.cameraLimits, 
                    this.windForce
                );
        this.physics = new Physics(
                    this.camera.scale, 
                    configuration.maxStrength
                );
        this.ui = new UserInterface();

        players["player1"] = new Player(
                    this.physics, 
                    "player1", 
                    (
                        this.firstTurnYours 
                        ? (this.playerNick || "you") 
                        : (this.opponentNick || "opponent")
                    )
                );
        players["player2"] = new Player(
                    this.physics, 
                    "player2", 
                    (
                        !this.firstTurnYours 
                        ? (this.playerNick || "you") 
                        : (this.opponentNick || "opponent")
                    )
                );

        this.game = new Game(
                    this.camera,
                    this.graphics.buffer.ctx,
                    this.physics,
                    this.terrainLine,
                    this.windForce
                ); //start game function
        
        this.notification.show("Game started", 2500, 2);
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
            this.notification.show(data.reason, 3000, 2);
            setTimeout(function(){gamemanager.stopGame();}, 3500, 3);
        }
    }

    handleGameEvents(data){
        this.game.handleGameEvents(data, this.opponent);

        this.showNotification(data);
    }

    showNotification(data){
        if(data.event == "nextturn"){
            this.windForce = data.wind_force;
            if(this.thisPlayer == currentPlayer)
                this.notification.show("Your's turn", 2000, 3);
            else
                this.notification.show("Opponent's turn", 2000, 3);
        } else if(data.event == "gameover"){	//message "gameover" contains players identity who won this game and reason
            gameinfo.status = 5;
            if(data.player == this.thisPlayer) 	//if you won
                if(data.reason == "surrender") 	//if your opponent surrendered
                    this.notification.show(
                        "Your opponent has surrendered", 3000, 2
                    );
                else this.notification.show("You WON!", 3000, 3);
            else if(data.player == this.opponent) 	//if your opponent won
                if(data.reason == "surrender") 				//if you surrendered
                    this.notification.show(
                        "You have surrendered", 3000, 2
                    );
                else this.notification.show("You LOSE!", 3000, 3);
            
            //delay to show text 
            setTimeout(() => this.stopGame(), 3500, 3);
        }            
    }

    keyboardControl(){
        this.control = function(e){
            var angle;
            switch (e.keyCode) {
                case 32:
                    // You can shoot if you is active player 
                    // and there was no shots in current turn.
                    if(!gamemanager.game.isShotMade 
                        && (gamemanager.thisPlayer == currentPlayer)
                    )
                    {
                        // Player can hold shoot button 
                        // to increase shoot strength.
                        shootButtonPressed = true; 
                    }
                    break;
                case 38:
                    // You can move aim pointer up or down only 
                    // if you are active player.
                    if(gamemanager.thisPlayer != currentPlayer)
                        break;
                    if(!players[gamemanager.thisPlayer].angle.upperBound(
                            players[gamemanager.thisPlayer].getAngle()
                        )
                    ) // If current angle greater max value 
                        // than set angle to max value.
                    {
                        angle = players[gamemanager.thisPlayer].angle.max;
                    } else {
                        angle = players[gamemanager.thisPlayer].getAngle() 
                            - players[gamemanager.thisPlayer].angle.increment_sign 
                            * 0.02;
                    }
                    
                    gamemanager.messageHandler.sendMessage(
                        "gamemsg", "aimchange", {"angle":angle}
                    );
                    gamemanager.game.setAimPointer(gamemanager.thisPlayer, angle);
                    break;
                case 40:
                    if(gamemanager.thisPlayer != currentPlayer)
                        break;
                    // If current angle less min value than 
                    // set angle to min value.
                    if(!players[gamemanager.thisPlayer].angle.lowerBound(
                            players[gamemanager.thisPlayer].getAngle()
                        )
                    )	
                    {
                        angle = players[gamemanager.thisPlayer].angle.min;
                    } else
                        angle = players[gamemanager.thisPlayer].getAngle() 
                            + players[gamemanager.thisPlayer].angle.increment_sign 
                            * 0.02;
                    
                    gamemanager.messageHandler.sendMessage(
                        "gamemsg", "aimchange", {"angle": + angle}
                    );
                    gamemanager.game.setAimPointer(gamemanager.thisPlayer, angle);
                    break;
                // case 37:
                //     translation += 1;
                //     if(translation > configuration.cameraLimits.left)
                //         translation = configuration.cameraLimits.left;

                //     if(isNaN(translation))
                //         console.log(translation);
                //     break;
                // case 39:
                //     translation -= 1;
                //     if(translation < configuration.cameraLimits.right)
                //         translation = configuration.cameraLimits.right;
                //     if(isNaN(translation))
                //         console.log(translation);
                //     break;
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
                                "strength":parseFloat(strength.toFixed(3)), 
                                "angle":parseFloat(players[gamemanager.thisPlayer].getAngle().toFixed(3))
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
        this.game.isShotMade = false;
        this.physics.destroyObjects();       
        this.physics = null;
        this.graphics.clearMainContext();
        window.removeEventListener("keydown", this.control);
        window.removeEventListener("keyup", this.shootControl);
    }

    draw(){
        //draw terrain, physics, notifications, ui in buffer
        this.graphics.clearBuffer();      
        
        this.game.draw(
                this.graphics.buffer.ctx, 
                this.graphics.buffer.width,
                this.physics.scale
            );
        this.graphics.draw(
                    this.physics.getBodyList(), 
                    this.windForce,
                    this.camera.translation
                );
        this.ui.draw(
                this.graphics.buffer.ctx, 
                this.graphics.buffer.width, 
                this.camera.scale, 
                configuration.maxStrength,
                this.camera.translation,
                this.thisPlayer
            );
        
        this.notification.draw(
                this.graphics.buffer.ctx, 
                this.graphics.buffer.width,
                this.physics.scale
            );  
    //    this.physics.draw();
        
        //draw buffer in main context
        this.graphics.clearMainContext();
        this.graphics.drawBuffer();
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