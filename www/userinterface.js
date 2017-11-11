class UserInterface{
    constructor(gamemanager){
        this.gamemanager = gamemanager;
        
        this.loading = new LoadingAnimation(resources["loading"]);
        this.battleButton = document.getElementById("battle_button");

        this.createInGameMenu();
    }

    registered(){
        this.inGameMenu.style.display = "none";

        this.battleButton.innerHTML = "Battle!";
        this.battleButton.onclick = () => {
            this.startSearch();
            return false;
        }
    }

    startSearch(){
        this.playerNick = document.getElementById("P1Nick").value;

        this.battleButton.innerHTML = "Stop searching";
        this.battleButton.onclick = function(){
            this.battleButton.innerHTML = "Battle!";
            this.loading.hide(document.getElementById("helloDialog"));
            this.battleButton.onclick = function(){
                this.startSearch();
                return false;
            }
            return false;
        }        
        this.loading.show(document.getElementById("helloDialog"));

        this.gamemanager.startSearch(this.playerNick);
    }

    stopSearch(){
        this.gamemanager.stopSearch();
    }

    gameStarted(){
        this.loading.hide(document.getElementById("helloDialog"));        
        document.getElementById("helloDialog").style.display = "none";	//hide menu
        document.getElementById("fade").style.display = "none";        
        this.inGameMenu.style.display = "block";
    }

    gameStopped(reason){
        if(reason == "connection"){ //if reason of game stop - connection with server lost
            this.battleButton.innerHTML = "Reconnect";
            this.battleButton.onclick = function(){
                location.reload();
                return false;
            }
        }
        else{	//if reason - any other
            this.battleButton.innerHTML = "Battle!";
            this.battleButton.onclick = () => {
                this.startSearch("Battle!");
                return false;
            }
        }
        this.loading.hide(document.getElementById("helloDialog"));
        this.inGameMenu.style.display = "none";
        document.getElementById("helloDialog").style.display = "block";
        document.getElementById("fade").style.display = "block";
    }

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

    showMenu(){
        this.menuButton.style.display = "none";
        this.inGameMenu.appendChild(this.surrenderButton);
        this.inGameMenu.appendChild(this.menuBackButton);
    }

    hideMenu(){
        this.inGameMenu.removeChild(this.surrenderButton);
        this.inGameMenu.removeChild(this.menuBackButton);
        this.menuButton.style.display = "block";
    }

    draw(context, width, scale, translation, strength, maxStrength, thisPlayer, currentPlayer){
        for(let p in players){
            let position = players[p].getCastlePosition();
            
            context.save();
            
            context.translate(
                (position.x + translation) * scale, 
                position.y * scale
            );
            
            //your nick is red
            if(thisPlayer == players[p].identity)
                context.fillStyle="#FF0000";
            else
                context.fillStyle="#000000";
            
                    
            context.font="10px 'Press Start 2P'";
            //show nick
            context.fillText(players[p].nick, -40, -70);	
            context.scale(scale, scale);
            context.fillStyle="#00FF00";
            //show remaining HP (green)
            context.fillRect(-2, -3, 4*players[p].HP/100, 0.2);	
            context.fillStyle="#FF0000";
            //show damage (red)
            context.fillRect(
                        -2+4*players[p].HP/100, 
                        -3, 
                        4*(1-players[p].HP/100), 
                        0.2
                    ); 
            
            // Current player has indicator of shoot strength 
            // (when holding shoot button).
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
            
            //show timer
            let timeLefted = 30 - gamemanager.elapsedTurnTime>>0;
            if(timeLefted < 0)
                timeLefted = 0;
            context.font="36px 'Press Start 2P'";
            if(timeLefted > 5)
                context.fillStyle="black";
            else
                context.fillStyle="#FF0000"; //if less than 5 sec then timer is red
            context.fillText(timeLefted, (width+40) / 2, scale*2); // 40 - offset in pixels to center timer
            
            context.restore();
        }
    }
}