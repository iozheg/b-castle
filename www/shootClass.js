var Shoot = function(physics, playerIdentity, strength, angle){

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
					}
				);
			this.cannonball.body.ApplyImpulse(
					new b2Vec2(
						Math.cos(angle)*strength, 
						Math.sin(angle)*strength
					), 
					this.cannonball.body.GetPosition()
				); //impulse after shot
			this.cannonball.body.ApplyForce(
					new b2Vec2(gameinfo.windforce, 0), 
					this.cannonball.body.GetPosition()
				);	//wind effect
			break;
		case "lasergun": //may be in future
			new Lasergun(
				players[playerIdentity].getPointerPosition(), 
				this.startPosition 
			);
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