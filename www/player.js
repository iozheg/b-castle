/**
 * Manages player.
 * Player's instance include Castle object and aimpointer.
 * Aimpointer is object with physic body and sprite that 'represents'
 * player's cannon. It can change it's angle. Not handles any
 * collisions.
 * 
 * @class Player
 */
class Player{
    /**
     * Creates an instance of Player.
     * Depending on identity players have different angle limits,
     * starting position.
     * @param {!Physics} physics 
     * @param {!string} identity This player identity for this game.
     *      Can be 'player1' or 'player2'.
     * @param {!string} nick 
     * @memberof Player
     */
    constructor(physics, identity, nick){
        this.HP = 100;
        this.identity = identity;
        this.nick = nick;
    
        if(identity == "player1"){
            var castleXPosition = 3;	
            var cannonXPosition = castleXPosition + 2;
            var cannonStartAngle = 5.5;	
            this.angle = {
                min: 6.28,
                max: 4.71,
                increment_sign: 1,
                upperBound: function(angle){
                    return (angle > this.max);
                },
                lowerBound: function(angle){
                    return (angle < this.min);
                }
            }
        }
        else{
            var castleXPosition = 101;
            var cannonXPosition = castleXPosition - 2;
            var cannonStartAngle = 3.84;			
            this.angle = {
                min: 3.14,
                max: 4.71,
                increment_sign: -1,
                upperBound: function(angle){
                    return (angle < this.max);
                },
                lowerBound: function(angle){
                    return (angle > this.min);
                }
            }
        }	

        this.castle = new Castle(
            physics, 
            {
                image: resources["castle"], 
                x: castleXPosition, 
                y: 33.5, 
                height: 3,  
                width: 4.5
            }, 
            this.identity, 
            this.nick
        );
        this.aimPointer = new Body(
            physics, 
            {
                image: resources["cannonleft"], 
                type: "static", 
                x: cannonXPosition, 
                y: 32.0, 
                height: 2, 
                width: 2, 
                angle: cannonStartAngle
            }
        );
        this.aimPointer.body.GetFixtureList().SetSensor(true);
    }
    
    /**
     * Returns current aimpointer angle.
     * 
     * @returns {number}
     * @memberof Player
     */
    getAngle(){
        return parseFloat(this.aimPointer.body.GetAngle().toFixed(5));
    }
    /**
     * Sets new angle.
     * 
     * @param {!number} angle 
     * @memberof Player
     */
    setAngle(angle){
        this.aimPointer.body.SetAngle(angle);
    }
    /**
     * Returns aimpointer position.
     * 
     * @returns {Object} {x,y}
     * @memberof Player
     */
    getPointerPosition(){
        return this.aimPointer.body.GetPosition();
    }
    /**
     * Returns castle position.
     * 
     * @returns {Object} {x,y}
     * @memberof Player
     */
    getCastlePosition(){
        return this.castle.body.GetPosition();
    }

    /**
     * Decreases player's HP.
     * 
     * @param {number} damage 
     * @memberof Player
     */
    hit(damage){
        this.HP -= damage;
    }
}