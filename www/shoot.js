/**
 * Manages shoot.
 * 
 * @class Shoot
 */
class Shoot{
    /**
     * Creates an instance of Shoot.
     * @param {!Physics} physics 
     * @param {!string} playerIdentity 
     * @param {!number} strength 
     * @param {!number} angle 
     * @param {!number} windForce 
     * @memberof Shoot
     */
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
    }

    /**
     * Returns position where shell started.
     * 
     * @returns {x,y}
     * @memberof Shoot
     */
    getStartPosition(){
        return this.startPosition;
    }
    /**
     * Returns current position of shell.
     * 
     * @returns {x,y}
     * @memberof Shoot
     */
    getCurrentPosition(){
        return this.cannonball.getCurrentPosition();
    }
    /**
     * Handles contact event.
     * 
     * @memberof Shoot
     */
    contact(){
        this.cannonball.contact();
    }
}