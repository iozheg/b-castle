class Shoot{
    constructor(physics, playerIdentity, strength, angle, windForce){
        let playersPosition = players[playerIdentity].getPointerPosition();
        this.startPosition = {
            x: parseFloat(
                (playersPosition.x + Math.cos(angle) * 2).toFixed(5)
            ),
            y: parseFloat(
                (playersPosition.y + Math.sin(angle) * 2).toFixed(5)
            )
        }
        
        switch(players[playerIdentity].selectedWeapon){
            case "cannonball":
                this.cannonball = new Cannonball(
                        physics, 
                        {
                            x: this.startPosition.x, 
                            y: this.startPosition.y, 
                            radius: 0.3, 
                            shape: "circle", 
                            kind: "cannonball"
                        },
                        resources["cannonball"],
                        {
                            angle: angle,
                            strength: strength,
                            windForce: windForce
                        }
                    );
                break;
        }
    }

    getStartPosition(){
        return this.startPosition;
    }
    getCurrentPosition(){
        return this.cannonball.getCurrentPosition();
    }
    contact(){
        this.cannonball.contact();
    }
}