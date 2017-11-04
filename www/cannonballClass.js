var Cannonball = function(physics, details){

    this.physics = physics;
	Cannonball.isOnScene = true; // Static variable. It serves to detect the presence of the cannonball. If it is than we shouldn't create one more
	Shell.call(this, physics, details);

};
Cannonball.prototype = Object.create(Shell.prototype);
Cannonball.prototype.constructor = Cannonball;

Cannonball.prototype.getCurrentPosition = function(){
	return this.body.GetPosition();
}

Cannonball.prototype.draw = function (context) {
    var pos = this.body.GetPosition(),
        angle = this.body.GetAngle();
	
    // Save the context
    context.save();
 
    // Translate and rotate
    context.translate(pos.x, pos.y);
	this.physics.terrainCollision(this);
 	
    context.rotate(angle); 
  
	context.drawImage(
        resources["cannonball"], 
        -this.details.radius*1.5, 
        -this.details.radius*1.5,
        this.details.radius*3,
        this.details.radius*3
    );
 
    context.restore();
};

Cannonball.prototype.contact = function(contact, impulse){
	window.bodiesForRemove.push(this);
	window.animations.push(new Animation("blast", this.body.GetPosition(), 3, 3, 13, false));
	setTimeout(function(){gamemanager.game.turnEnd()}, 500);
}

