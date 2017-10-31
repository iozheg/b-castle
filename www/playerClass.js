var Player = function(physics, identity, nick){
	this.identity = identity;
	this.nick = nick;
	this.selectedWeapon = "cannonball"; //in future there may other types of shots

	if(identity == "player1"){
		this.castle = new Castle(physics, {image: resources["castle"], x: 3, y: 33.5, height: 3,  width: 4.5}, this.identity, this.nick);
		this.aimPointer = new Body(physics, {image: resources["cannonleft"], type: "static", x: 5, y: 32.0, height: 2, width: 2, angle: 5.5});
		this.aimPointer.body.GetFixtureList().SetSensor(true);
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
		this.castle = new Castle(physics, {image: resources["castle"], x: 101, y: 33.5, height: 3,  width: 4.5}, this.identity, this.nick);
		this.aimPointer = new Body(physics, {image: resources["cannonleft"], type: "static", x: 99, y: 32.0, height: 2, width: 2, angle: 3.84});
		this.aimPointer.body.GetFixtureList().SetSensor(true);
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
}

Player.prototype.getAngle = function(){
	return this.aimPointer.body.GetAngle();
}
Player.prototype.setAngle = function(angle){
	this.aimPointer.body.SetAngle(angle);
}
Player.prototype.getPointerPosition = function(){
	return this.aimPointer.body.GetPosition();
}
Player.prototype.getCastlePosition = function(){
	return this.castle.body.GetPosition();
}