class Player{
    constructor(physics, identity, nick){
        this.HP = 100;
        this.identity = identity;
        this.nick = nick;
        this.selectedWeapon = "cannonball"; //in future there may other types of shots
    
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
                upperBound: function(angle){ //if angle less max value?
                    return (angle < this.max);
                },
                lowerBound: function(angle){ //if angle greater min value?
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
    
    getAngle(){
        return parseFloat(this.aimPointer.body.GetAngle().toFixed(5));
    }
    setAngle(angle){
        this.aimPointer.body.SetAngle(angle);
    }
    getPointerPosition(){
        return this.aimPointer.body.GetPosition();
    }
    getCastlePosition(){
        return this.castle.body.GetPosition();
    }

    hit(damage){
        this.HP -= damage;
    }
}