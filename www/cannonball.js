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

        console.log(this.body.GetPosition());
    }

    getCurrentPosition(){
        let pos = this.body.GetPosition();
        if(isNaN(pos.x)){
            console.log(pos);
            this.body.SetPosition({
                x: this.details.x, 
                y: pos.y, 
                z: pos.z
            }); //HACK?
        }
        return this.body.GetPosition();
    }

    contact(contact, impulse){
        this.physics.pushObjectForRemove(this);
        new Animation("blast", this.body.GetPosition(), 3, 3, 13, false)
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