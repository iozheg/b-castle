class Cannonball extends Shell{
    constructor(physics, details, image, shootParams){
        super(physics.world, details);
        this.physics = physics;
        this.image = image;
        this.details = details;

        //impulse after shot
        this.body.ApplyImpulse(
                    new b2Vec2(
                        Math.cos(shootParams.angle)*shootParams.strength,
                        Math.sin(shootParams.angle)*shootParams.strength
                    ), 
                    this.body.GetPosition()
                ); 
        //wind effect
        this.body.ApplyForce(
                    new b2Vec2(shootParams.windForce, 0), 
                    this.body.GetPosition()
                );	
    }

    getCurrentPosition(){
        let pos = this.body.GetPosition();
        if(isNaN(pos.x) || isNaN(pos.y)){
            console.log(pos);
            this.body.setPosition(this.details.x); //HACK?
        }
        return this.body.GetPosition();
    }

    contact(contact, impulse){
        window.bodiesForRemove.push(this);
        window.animations.push(
            new Animation("blast", this.body.GetPosition(), 3, 3, 13, false)
        );
        setTimeout(function(){gamemanager.game.turnEnd()}, 500); 
    }

    draw(context){
        let pos = this.body.GetPosition(), angle = this.body.GetAngle();
	
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
    }
}