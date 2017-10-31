var Shoot = function(physics, playerIdentity, strength, angle){

	this.startPosition = {
		x: players[playerIdentity].getPointerPosition().x + Math.cos(angle) * 2,
		y: players[playerIdentity].getPointerPosition().y + Math.sin(angle) * 2
	}
	
	switch(players[playerIdentity].selectedWeapon){
		case "cannonball":
			this.cannonball = new Cannonball(physics, {x: this.startPosition .x, y: this.startPosition .y, radius: 0.3, shape: "circle", kind: "cannonball"});
			this.cannonball.body.ApplyImpulse(new b2Vec2(Math.cos(angle)*strength, Math.sin(angle)*strength), this.cannonball.body.GetPosition()); //impulse after shot
			this.cannonball.body.ApplyForce(new b2Vec2(physics.wind.force, 0), this.cannonball.body.GetPosition());	//wind effect
			break;
		case "lasergun": //may be in future
			new Lasergun(players[playerIdentity].getPointerPosition(), this.startPosition );
			break;
	}
}
	
Shoot.prototype.getStartPosition = function(){
	return this.startPosition;
}
Shoot.prototype.getCurrentPosition = function(){
	return this.cannonball.getCurrentPosition();
}
Shoot.prototype.contact = function(){
	this.cannonball.contact();
}