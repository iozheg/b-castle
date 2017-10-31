var Cannonball = function(physics, details){

	Cannonball.isOnScene = true; // Static variable. It serves to detect the presence of the cannonball. If it is than we shouldn't create one more
	Shell.call(this, physics, details);

};
Cannonball.prototype = Object.create(Shell.prototype);
Cannonball.prototype.constructor = Cannonball;

Cannonball.prototype.getCurrentPosition = function(){
	return this.body.GetPosition();
}

Cannonball.prototype.draw = function (physics) {
    var pos = this.body.GetPosition(),
        angle = this.body.GetAngle();
	
    // Save the context
    physics.context.save();
 
    // Translate and rotate
    physics.context.translate(pos.x, pos.y);
	physics.terrainCollision(this);
 	
    physics.context.rotate(angle); 
  
	physics.context.drawImage(resources["cannonball"], -this.details.radius*1.5, -this.details.radius*1.5,
    this.details.radius*3,
    this.details.radius*3);
 
    physics.context.restore();
};

Cannonball.prototype.contact = function(contact, impulse){
	window.bodiesForRemove.push(this);
	window.animations.push(new Animation("blast", this.body.GetPosition(), 3, 3, 13, false));
	setTimeout(function(){game.turnEnd()}, 500);
}

