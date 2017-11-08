class UserInterface{
    constructor(){
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
            gamemanager.messageHandler.sendMessage("gamemsg", "surrender");
        }
    }

    draw(context, width, scale, maxStrength, translation, thisPlayer){        
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
                            4*(window.strength)/maxStrength, 
                            0.2
                        );
            }
            
            context.restore();
            context.save();
            
            //show timer
            let timeLefted = 30 - gamemanager.game.elapsedTurnTime>>0;
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