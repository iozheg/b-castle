class GameManager{
    constructor(battleButton){
        this.messageHandler = new MessageHandler(
            this,
            this.register,
            this.handleGameEvents,
            this.search,
            this.message
        );
        
        this.loading = new LoadingAnimation(resources["loading"]);
        this.battleButton = battleButton;
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

    search(data){
        gameinfo.status = 4;
        gameinfo.opponent_id = data.opponent_id;
        gameinfo.oppnick = data.opponent_nick;
        
        if(data.turn == "yes"){
            gameinfo.you = "player1";
            gameinfo.opponent = "player2";
            gameinfo.turn = true;
        }
        gameinfo.windforce = data.windforce;
        gameinfo.terrain = JSON.parse(data.terrain);
        this.startGame();
    }

    startGame(){
        this.loading.hide(document.getElementById("helloDialog"));
        
        document.getElementById("helloDialog").style.display = "none";	//hide menu
        document.getElementById("fade").style.display = "none";
        gameState = "running";	//playing - game was started, stop - game wasn't started, pause - game was paused after start by ESC key
        this.game = new Game(
            document.getElementById("b2dCanvas"), 
            configuration.scale, 
            configuration.cameraLimits, 
            configuration.maxStrength
        ); //start game function
    }

    stopGame(reason){
        if(this.game){
            this.game.stop();
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
        if(data.event == "aimchange")
            this.game.setAimPointer(
            gameinfo.opponent, 
            data.angle
        );
        else if(data.event == "shot")
            this.game.shoot(
                data.player, 
                data.strength, 
                data.angle
            );
        else if(data.event == "nextturn")
            this.game.changePlayer(
                data.player, 
                data.windforce
            );
        else if(data.event == "hit"){
            this.game.hitPlayer(data.player, data.damage);
        }
        else if(data.event == "gameover"){			//message "gameover" contains players identity who won this game and reason
            gameinfo.status = 5;
            if(data.player == gameinfo.you) 	//if you won
                if(data.reason == "surrender") 	//if your opponent surrendered
                    this.game.notification.show(
                        "Your opponent has surrendered", 3000, 2
                    );
                else this.game.notification.show("You WON!", 3000, 3);
            else if(data.player == gameinfo.opponent) 	//if your opponent won
                if(data.reason == "surrender") 				//if you surrendered
                    this.game.notification.show(
                        "You have surrendered", 3000, 2
                    );
                else this.game.notification.show("You LOSE!", 3000, 3);
                
            setTimeout(function(){this.stopGame();}, 3500, 3); 	//delay to show text
        }
    }
}