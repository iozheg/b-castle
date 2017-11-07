var Cannonball = function(physics, details, image){

    this.physics = physics;
	Cannonball.isOnScene = true; // Static variable. It serves to detect the presence of the cannonball. If it is than we shouldn't create one more
    Shell.call(this, physics, details);
    this.image = image;
//    console.log("Cannonball " );
//    console.log(this.body.GetPosition());

};
Cannonball.prototype = Object.create(Shell.prototype);
Cannonball.prototype.constructor = Cannonball;

Cannonball.prototype.getCurrentPosition = function(){
    let pos = this.body.GetPosition();
    if(isNaN(pos.x) || isNaN(pos.y)){
        console.log(pos);
        this.body.setPosition(this.details.x); //HACK?
    }
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
        this.image, 
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

