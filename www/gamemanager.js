/**
 * Main game controller.
 * Manages game variables, creates game objects, handles game events,
 *   controls game loop.
 * Algorithm:
 *  1. After opening page, browser tries to open WebSocket connection
 *     to server.
 *  2. If successful player can start searching for opponent.
 *  3. Once opponent is found server sends battle parametrs: 
 *     opponetn's nick, terrain, wind force for first turn, who makes
 *     first move. Using this info GameManager configures game.
 *  4. After configuring GameManager initializes graphics, terrain,
 *     physics, players and game scene borders.
 *  5. Launches game loop.
 * @class GameManager
 */
class GameManager{
    /**
     * Creates an instance of GameManager.
     * @param {!Camera} camera This obj handles context translation,
     *      includes sclae factor.
     * @param {!HTMLElement} canvas This used for initializing
     *      graphics component and drawing scene.
     * @memberof GameManager
     */
    constructor(camera, canvas){
        /**
         * Obj for sending messages and recieving server messages.
         * Also establishes and controls WebSocket connection.
         */
        this.messageHandler = new MessageHandler(
                                this,
                                this.register,
                                this.handleGameEvents,
                                this.startGame,
                                this.message
                            );
        /**
         * Used for showing in game notifications (Game started,
         * Your's turn and other).
         */        
        this.notification = new SimpleNotification();  
        /**
         * Creates user interface (buttons, player's nick, HP, wind arrow).
         */      
        this.ui = new UserInterface(this);

        this.camera = camera;
        this.canvas = canvas;

        /** Max strength of shot. */
        this.maxStrength = 30;
        /** Current shot strength. */
        this.strength = 0;
        /** @type {!Array<number>} */
        this.terrainLine = [];
        /** Wind force for current turn. */
        this.windForce = 0;
        this.opponentNick = "";
        this.playerNick = "";
        /** 
         * Identity of this player.
         * Both players have their identity: 'player1' or 'player2'.
         * Player's identity who makes first move - 'player1'.
         * This used for managing turn changing, UI drawing, game 
         * events.
         */
        this.thisPlayer = "";
        /** Identity of opponent. */
        this.opponent = "";
        /** Identity that shows whose turn now. player1 always first.*/
        this.whoseTurn = "player1";
        /** 
         * This flag shows that shot was made.
         * If shot was made than player can't fire once in this turn.
         * Also during drawing this help to intialize check if there 
         * is collision with terrain.
         */
        this.isShotMade = false;
        /** @type {!Shoot} */
        this.shot;
        /** 
         * Flag that shows if shoot button was pressed.
         * Used to increase shot strength and prevent multiple shots.
         * */
        this.shootButtonPressed = false;
        /**
         * Time of last frame in milliseconds.
         * Used for physics calculations.
         */
        this.lastFrame = new Date().getTime();
        /**
         * Time when turn started in seconds.
         * Used for detecting when turn's time is out.
         */
        this.turnStartTime = new Date().getTime()/1000;
        /** Shows how much time has passed from turn start in seconds. */
        this.elapsedTurnTime = 0;    
        /**
         * Shows if turn's time counter is active.
         * When player makes shot we stop time so clients whouldn't
         * send to server signal that time is over.
         */    
        this.timeCounterIsActive = true;
        /** Flag for controlling game loop.
         * running - game is running, stop - game stopped.
         */
        this.gameState = "stop";
    }

    /**
     * Callback handles registration on server.
     * When registered changes UI. Called by this.messageHandler.
     * 
     * @param {!Object} data 
     * @memberof GameManager
     */
    register(data){
        if(data.result == "registered") {
            this.ui.registered();
        }
    }

    /**
     * Handles search start.
     * Sends to server signal that player is searching for opponent.
     * Called by this.ui.
     * 
     * @memberof GameManager
     */
    startSearch(){
        this.playerNick = document.getElementById("P1Nick").value;
        this.messageHandler.sendMessage(
                            "search", 
                            null, 
                            {nick: this.playerNick}
                        );
    }

    /**
     * Handles search stop.
     * Sends to server signal that player stopped searching 
     * for opponent. Called by this.ui.
     * 
     * @memberof GameManager
     */
    stopSearch(){
        this.messageHandler.sendMessage("stopsearch");
    }
    
    /**
     * Callback handles game start event.
     * Configures game and initializes graphics, terrain, physics,
     * players and game scene borders. Launches game loop.
     * Called by this.messageHandler.
     * 
     * @param {!Object} data
     * @memberof GameManager
     */
    startGame(data){
        this.ui.gameStarted();
        this.configureGame(data);
        this.keyboardControl();
               
        this.graphics = new Graphics(
                    canvas,
                    this.camera.scale,
                    this.camera.cameraLimits,
                    this.windForce
                );
        this.terrain = new Terrain(
                    this.graphics.buffer.ctx,
                    this.terrainLine
                );
        this.physics = new Physics(
                    this.camera.scale,
                    this.terrain,
                    {
                        context: this,
                        callback: this.turnEnd
                    }
                );

        this.createPlayers();
        this.createGround();
        
        this.notification.show("Game started", 2500, 2);

        this.lastFrame = new Date().getTime();
        this.turnStartTime = new Date().getTime()/1000;
        this.elapsedTurnTime = 0;
        this.gameState = "running";
        requestAnimationFrame(gameLoop);
    }

    /**
     * Configure game using data from server.
     * 
     * @param {any} data
     * @memberof GameManager
     */
    configureGame(data){
        this.opponentNick = data.opponent_nick;
        this.windForce = data.wind_force;
        this.terrainLine = JSON.parse(data.terrain);
        
        if(data.turn == "yes"){
            this.thisPlayer = "player1";
            this.opponent = "player2";
        } else {
            this.thisPlayer = "player2";
            this.opponent = "player1";
        }
    }

    /**
     * Creates players.
     * 
     * @memberof GameManager
     */
    createPlayers(){
        players["player1"] = new Player(
            this.physics,
            "player1",
            (
                this.thisPlayer == "player1"
                ? (this.playerNick || "you")
                : (this.opponentNick || "opponent")
            )
        );
        players["player2"] = new Player(
            this.physics,
            "player2",
            (
                this.thisPlayer == "player2"
                ? (this.playerNick || "you")
                : (this.opponentNick || "opponent")
            )
        );
    }

    /**
     * Creates ground.
     * 
     * @memberof GameManager
     */
    createGround(){
        new Body(
            this.physics,
            { type: "static", x: 0, y:35.5, height: 0.5, width: 220 }
        );
    }

    /**
     * Stops game.
     * 
     * @param {any} reason 
     * @memberof GameManager
     */
    stopGame(reason){
        try{
            this.toInitialState();
        }
        finally{
            this.ui.gameStopped(reason);
        }
    }

    /**
     * Handles non-game events.
     * When opponent lost his connection with server we notify player.
     * 
     * @param {!Object} data
     * @memberof GameManager
     */
    message(data){
        if(data.event == "stopgame"){
            this.notification.show(data.reason, 3000, 2);
            setTimeout(()=> this.stopGame(), 3500, 3);
        }
    }

    /**
     * Handles events related to battle.
     * 
     * @param {!Object} data
     * @memberof GameManager
     */
    handleGameEvents(data){
        if(data.event == "aimchange"){
            this.setAimPointer(this.opponent, data.angle);
        } else if(data.event == "shot"){
            this.shoot(data.player, data.strength, data.angle);
        } else if(data.event == "nextturn"){
            this.changePlayer(data.player);
            this.windForce = data.wind_force;
        } else if(data.event == "hit"){
            this.hitPlayer(data.player, data.damage);
        }

        // We should tell player about some events.
        this.showNotification(data);
    }

    /**
     * Begins new turn.
     * Changes active player, moves camera to active player. Next
     * turn begins only when server sends appropriate signal.
     * 
     * @param {!string} playerIdentity Who is active player now.
     * @memberof GameManager
     */
    changePlayer(playerIdentity){
        this.whoseTurn = playerIdentity;

        if(this.whoseTurn == "player1")
            this.camera.setToLeftBorder();
        else 
            this.camera.setToRightBorder();

        this.turnStartTime = new Date().getTime()/1000;
        this.timeCounterIsActive = true;
        this.elapsedTurnTime = 0;
        this.isShotMade = false;
    }

    /**
     * Changes angle of player aim.
     * 
     * @param {!string} playerIdentity Whose aim is changing.
     * @param {!number} angle New angle.
     * @memberof GameManager
     */
    setAimPointer(playerIdentity, angle){
        players[playerIdentity].setAngle(angle);
    }

    /**
     * Makes shot.
     * Shot is made only when server sends appropriate signal.
     * 
     * @param {!string} playerIdentity Who is shotting.
     * @param {!number} strength Strength of shoot.
     * @param {!number} angle Aim angle when player shooted.
     * @memberof GameManager
     */
    shoot(playerIdentity, strength, angle){
        this.timeCounterIsActive = false;
        this.isShotMade = true;
        this.shot = new Shoot(
                    this.physics,
                    playerIdentity,
                    strength,
                    angle,
                    this.windForce
                );
    }

    /**
     * Handles server's signal that player was damaged.
     * Amount of damage is also sent from server.
     * 
     * @param {!string} playerIdentity Who was damaged.
     * @param {!number} damage Amount of damage.
     * @memberof GameManager
     */
    hitPlayer(playerIdentity, damage){
        players[playerIdentity].hit(damage);
    }

    /**
     * Sends message to the server that turn has ended.
     * 
     * @memberof GameManager
     */
    turnEnd(){
        this.isShotMade = false;
        this.messageHandler.sendMessage("gamemsg", "nextturn");
    }

    /**
     * Shows some notifications on game scene.
     * 
     * @param {!Object} data
     * @memberof GameManager
     */
    showNotification(data){
        if(data.event == "nextturn"){
            if(this.thisPlayer == this.whoseTurn){
                this.notification.show("Your's turn", 2000, 3);
            } else{
                this.notification.show("Opponent's turn", 2000, 3);
            }
        } else if(data.event == "gameover"){
            if(data.player == this.thisPlayer){
                if(data.reason == "surrender"){
                    this.notification.show(
                        "Your opponent has surrendered", 3000, 2
                    );
                } else {
                    this.notification.show("You WON!", 3000, 3);
                }
            } else if(data.player == this.opponent){
                if(data.reason == "surrender"){
                    this.notification.show("You have surrendered", 3000, 2);
                } else {
                    this.notification.show("You LOSE!", 3000, 3);
                }
            }            
            // Delay to show text after which game will be stopped.
            setTimeout(() => this.stopGame(), 3500, 3);
        }            
    }


    /**
     * Initializes keyboard control and adds event listners.
     * 
     * @memberof GameManager
     */
    keyboardControl(){
        this.control = function(e){
            // Player can control aim and shoot only if he is active
            // player in current turn.
            if(gamemanager.thisPlayer != gamemanager.whoseTurn){
                return false;
            }

            let angle;
            switch (e.keyCode) {
                case 32:
                    // Player can shoot if he there was no shots in 
                    // current turn.
                    if(!gamemanager.isShotMade){
                        // Player can hold shoot button to increase 
                        // shoot strength.
                        gamemanager.shootButtonPressed = true; 
                    }
                    break;
                case 38:          
                    // If current angle greater max value than set 
                    // angle to max value.
                    if(!players[gamemanager.thisPlayer].angle.upperBound(
                            players[gamemanager.thisPlayer].getAngle()
                        )
                    ){
                        angle = players[gamemanager.thisPlayer].angle.max;
                    } else {
                        angle = players[gamemanager.thisPlayer].getAngle()
                            - players[gamemanager.thisPlayer].angle.increment_sign
                            * 0.02;
                    }
                    
                    // To change this player's aim on opponent screen
                    // we send appropriate signal.
                    gamemanager.messageHandler.sendMessage(
                        "gamemsg", "aimchange", {"angle":angle}
                    );
                    gamemanager.setAimPointer(gamemanager.thisPlayer, angle);
                    break;
                case 40:
                    if(gamemanager.thisPlayer != gamemanager.whoseTurn)
                        break;
                    // If current angle less min value than
                    // set angle to min value.
                    if(!players[gamemanager.thisPlayer].angle.lowerBound(
                            players[gamemanager.thisPlayer].getAngle()
                        )
                    ){
                        angle = players[gamemanager.thisPlayer].angle.min;
                    } else
                        angle = players[gamemanager.thisPlayer].getAngle()
                            + players[gamemanager.thisPlayer].angle.increment_sign
                            * 0.02;
                    
                    gamemanager.messageHandler.sendMessage(
                        "gamemsg", "aimchange", {"angle": + angle}
                    );
                    gamemanager.setAimPointer(gamemanager.thisPlayer, angle);
                    break;
            }
        };


        /** 
         * When player release fire button sends signal to server.
         * If shootButtonPressed == false than player already have
         * shooted in this turn or he is not active player now.
         * */
        this.shootControl = function(e){
            if(e.keyCode == 32 && gamemanager.shootButtonPressed){
                gamemanager.shootButtonPressed = false;
                gamemanager.messageHandler.sendMessage(
                            "gamemsg",
                            "shot",
                            {
                                "strength":parseFloat(
                                    gamemanager.strength.toFixed(3)
                                ), 
                                "angle":parseFloat(
                                    players[gamemanager.thisPlayer].getAngle().toFixed(3)
                                )
                            }
                        );
                gamemanager.strength = 0;
            }
        };

        window.addEventListener("keydown", this.control);
        window.addEventListener("keyup", this.shootControl);
    }

    /**
     * Returns game to initial state.
     * 
     * @memberof GameManager
     */
    toInitialState(){
        this.gameState = "stop";
        this.whoseTurn = "player1";
        this.strength = 0;
        this.isShotMade = false;
        this.physics.destroyAllObjects();
        this.physics = null;
        this.graphics.clearMainContext();
        this.graphics = null;
        this.terrain = [];        
        this.shootButtonPressed = false;

        players = [];
        animations = [];

        window.removeEventListener("keydown", this.control);
        window.removeEventListener("keyup", this.shootControl);
    }

    /**
     * Draws scene.
     * Prepares buffer than draws it to main canvas.
     * 
     * @memberof GameManager
     */
    draw(){
        this.graphics.clearBuffer();      
        
        this.terrain.draw(
                this.graphics.buffer.ctx, 
                this.camera.scale, 
                this.camera.translation
            );

        // When shot is done we must control that it is not out of
        // horizontal scene borders otherwise we must delete it 
        // (call contact method). Also make camera to follow it.
        if(this.isShotMade){
            let currentPosition = this.shot.getCurrentPosition();            
            
            if(!this.camera.isObjectInSceneBorders(currentPosition)){
                this.shot.contact();
                this.isShotMade = false;
            }
        
            this.camera.followObject(currentPosition);
        }
        this.graphics.draw(
                    this.physics.getBodyList(), 
                    this.windForce,
                    this.camera.translation
                );
        this.ui.draw(
                this.graphics.buffer.ctx, 
                this.graphics.buffer.width, 
                this.camera.scale, 
                this.camera.translation,                
                this.strength,
                this.maxStrength,
                this.thisPlayer,
                this.whoseTurn
            );        
        this.notification.draw(
                this.graphics.buffer.ctx, 
                this.graphics.buffer.width,
                this.physics.scale
            );  
        
        //draw buffer in main context
        this.graphics.clearMainContext();
        this.graphics.drawBuffer();
    }
}

/**
 * Main game loop.
 * Controls turn's time, current strength, initiates physics
 * calculations and scene draw.
 */
window.gameLoop = function() {
    //main game loop
    if(gamemanager.gameState == "stop")
        return;
    var tm = new Date().getTime();
    
    if(gamemanager.timeCounterIsActive)
        gamemanager.elapsedTurnTime = tm/1000 - gamemanager.turnStartTime;
    if(gamemanager.elapsedTurnTime >= 30 && gamemanager.timeCounterIsActive){
        gamemanager.messageHandler.sendMessage("gamemsg", "turntimeover");
        gamemanager.timeCounterIsActive = false;
    }
        
    requestAnimationFrame(gameLoop);
    var dt = (tm - gamemanager.lastFrame) / 1000;
    if(dt > 1/15) { dt = 1/15; }

    if(gamemanager.shootButtonPressed){
        gamemanager.strength >= gamemanager.maxStrength 
        ? gamemanager.strength = gamemanager.maxStrength 
        : gamemanager.strength += 0.3;
    }
    
    gamemanager.physics.step(dt);
    gamemanager.lastFrame = tm;
    gamemanager.draw();
};