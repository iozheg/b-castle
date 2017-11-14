/**
 * Physical and graphical representation of cannonball.
 * 
 * @class Cannonball
 * @extends {Shell}
 */
class Cannonball extends Shell{
    /**
     * Creates an instance of Cannonball.
     * @param {!Physics} physics 
     * @param {!Object} details Physic body properties: start
     *      position, radius, shape and kind.
     * @param {!Image} image Cannonball sprite.
     * @param {!Object} shootParams Shoot parametrs: angle, strength
     *      and wind force.
     * @memberof Cannonball
     */
    constructor(physics, details, image, shootParams){
        super(physics.world, details);
        this.physics = physics;
        this.image = image;
        this.details = details;
        /** Starting impulse. */
        this.body.ApplyImpulse(
                    new b2Vec2(
                        Math.cos(shootParams.angle)*shootParams.strength,
                        Math.sin(shootParams.angle)*shootParams.strength
                    ),
                    this.body.GetPosition()
                ); 
        /** This force represents wind effect. */
        this.body.ApplyForce(
                    new b2Vec2(shootParams.windForce, 0), 
                    this.body.GetPosition()
                );

    //    console.log(this.body.GetPosition());
    }

    /**
     * Returns current position of physic body.
     * 
     * @returns {x,y}
     * @memberof Cannonball
     */
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

    /**
     * Manages contact with other body or terrain.
     * When cannonbal contacts with something it explodes and must be
     * deleted from scene. Also here played blast animation.
     * 
     * @param {!Box2D Object} contact 
     * @param {!Box2D Object} impulse 
     * @memberof Cannonball
     */
    contact(contact, impulse){
        this.physics.pushObjectForRemove(this);
        new Animation("blast", this.body.GetPosition(), 3, 3, 13, false)
    }

    /**
     * Draw cannonball to context.
     * Every frame we make check for collision with terrain.
     * 
     * @param {!CanvasRenderingContext2D} context 
     * @memberof Cannonball
     */
    draw(context){
        let pos = this.body.GetPosition(), angle = this.body.GetAngle();

        context.save();
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