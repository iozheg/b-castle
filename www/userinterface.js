/**
 * Manages user inteface.
 * 
 * @class UserInterface
 */
class UserInterface{
    /**
     * Creates an instance of UserInterface.
     * @param {!GameManager} gamemanager 
     * @memberof UserInterface
     */
    constructor(gamemanager){
        this.gamemanager = gamemanager;
        /** Loading animation when player searchs opponent. */
        this.loading = new LoadingAnimation(
                                resources["loading"],
                                document.getElementById("helloDialog")
                            );
        this.battleButton = document.getElementById("battle_button");

        this.createInGameMenu();
    }

    /**
     * Handles ui behaviour when client registered on server.
     * 
     * @memberof UserInterface
     */
    registered(){
        this.inGameMenu.style.display = "none";

        this.battleButton.innerHTML = "Battle!";
        this.battleButton.onclick = () => {
            this.startSearch();
            return false;
        }
    }

    /**
     * Handles ui behaviour when client starts searching opponent.
     * 
     * @memberof UserInterface
     */
    startSearch(){
        let that = this;
        this.playerNick = document.getElementById("P1Nick").value;

        this.battleButton.innerHTML = "Stop searching";
        this.battleButton.onclick = function(){
            that.battleButton.innerHTML = "Battle!";
            that.loading.hide();
            that.battleButton.onclick = function(){
                that.startSearch();
                return false;
            }
            return false;
        }        
        this.loading.show();

        this.gamemanager.startSearch(this.playerNick);
    }

    /**
     * Handles ui behaviour when client stops searching opponent.
     * 
     * @memberof UserInterface
     */
    stopSearch(){
        this.gamemanager.stopSearch();
    }

    /**
     * Handles ui behaviour when battle starts.
     * 
     * @memberof UserInterface
     */
    gameStarted(){
        this.loading.hide();        
        document.getElementById("helloDialog").style.display = "none";	//hide menu
        document.getElementById("fade").style.display = "none";        
        this.inGameMenu.style.display = "block";
    }

    /**
     * Handles ui behaviour when game stopped by some reason.
     * If reason 'connetion' then game stopped because connection with
     * server was lost.
     * 
     * @param {!string} reason 
     * @memberof UserInterface
     */
    gameStopped(reason){
        if(reason == "connection"){
            this.battleButton.innerHTML = "Reconnect";
            this.battleButton.onclick = function(){
                location.reload();
                return false;
            }
        } else{
            this.battleButton.innerHTML = "Battle!";
            this.battleButton.onclick = () => {
                this.startSearch("Battle!");
                return false;
            }
        }
        this.loading.hide();
        this.inGameMenu.style.display = "none";
        document.getElementById("helloDialog").style.display = "block";
        document.getElementById("fade").style.display = "block";
    }

    /**
     * Creates ingame menu.
     * 
     * @memberof UserInterface
     */
    createInGameMenu(){
        this.inGameMenu = document.createElement("div");
        this.menuButton = document.createElement("button");
        this.menuBackButton = document.createElement("button");
        this.surrenderButton = document.createElement("button");
        
        this.menuButton.innerHTML = "Menu";
        this.menuButton.className = "menu_button";
        this.inGameMenu.className = "ingamemenu";
        this.inGameMenu.appendChild(this.menuButton);
        this.menuBackButton.innerHTML = "Back";
        this.surrenderButton.innerHTML = "Surrender";
        document.body.appendChild(this.inGameMenu);
        
        this.menuButton.onclick = () => this.showMenu();
        
        this.menuBackButton.onclick = () => this.hideMenu();
        
        this.surrenderButton.onclick = function(){
            gamemanager.messageHandler.sendMessage("gamemsg", "surrender");
        }
    }

    /**
     * Shows ingame menu.
     * 
     * @memberof UserInterface
     */
    showMenu(){
        this.menuButton.style.display = "none";
        this.inGameMenu.appendChild(this.surrenderButton);
        this.inGameMenu.appendChild(this.menuBackButton);
    }

    /**
     * Hides ingame menu.
     * 
     * @memberof UserInterface
     */
    hideMenu(){
        this.inGameMenu.removeChild(this.surrenderButton);
        this.inGameMenu.removeChild(this.menuBackButton);
        this.menuButton.style.display = "block";
    }

    /**
     * Draws ui in context.
     * Draws player's nick, health points indicator, shoot strength
     * indocator, turn timer.
     * 
     * @param {!CanvasRenderingContext2D} context 
     * @param {!number} width 
     * @param {!number} scale 
     * @param {!number} translation 
     * @param {!number} strength Current shoot strength.
     * @param {!number} maxStrength 
     * @param {!string} thisPlayer This player.
     * @param {!string} currentPlayer Current active player.
     * @memberof UserInterface
     */
    draw(context, width, scale, translation, strength, maxStrength, thisPlayer, currentPlayer){
        for(let p in players){
            let position = players[p].getCastlePosition();
            
            context.save();            
            context.translate(
                (position.x + translation) * scale, 
                position.y * scale
            );
            
            /** This player's nick has red color. */
            if(thisPlayer == players[p].identity)
                context.fillStyle="#FF0000";
            else
                context.fillStyle="#000000";
            
                    
            context.font="10px 'Press Start 2P'";
            context.fillText(players[p].nick, -40, -70);	
            context.scale(scale, scale);
            context.fillStyle="#00FF00";
            /** Remaining HP has green color. */
            context.fillRect(-2, -3, 4*players[p].HP/100, 0.2);	
            context.fillStyle="#FF0000";
            /** Lost HP has red color. */
            context.fillRect(
                        -2+4*players[p].HP/100, 
                        -3, 
                        4*(1-players[p].HP/100), 
                        0.2
                    ); 
            
            /** Only active player can have shoot strength indicator. */
            if(currentPlayer == players[p].identity){
                context.fillStyle="#0000dd";
                context.fillRect(
                            -2, 
                            -2.7, 
                            4*(strength)/maxStrength, 
                            0.2
                        );
            }
            
            context.restore();
            context.save();
            
            /**
             * Draw timer. When less then 5 seconds left it became red
             * color.
             */
            let timeLefted = 30 - gamemanager.elapsedTurnTime>>0;
            if(timeLefted < 0)
                timeLefted = 0;
            context.font="36px 'Press Start 2P'";
            if(timeLefted > 5)
                context.fillStyle="black";
            else
                context.fillStyle="#FF0000";
            /* 40 - offset in pixels to center timer on screen. */
            context.fillText(timeLefted, (width+40) / 2, scale*2);
            
            context.restore();
        }
    }
}