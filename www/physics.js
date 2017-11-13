var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
/**
 * Manages physic world of game.
 * 
 * @class Physics
 */
class Physics{
    /**
     * Creates an instance of Physics.
     * @param {!number} scale The ratio of the dimensions of the canvas
     *      to the dimension of the physical world.
     * @param {!Terrain} terrain Terrain object.
     * @param {!Object} callbackOnContact Object that contains execution
     *      context (link to GameManager instance) and method that would
     *      be called when Shell object will contact with something.
     * @memberof Physics
     */
    constructor(scale, terrain, callbackOnContact){
        let gravity = new b2Vec2(0,9.8);
        this.world = new b2World(gravity, true);
        this.scale = scale;
        this.dtRemaining = 0;
        this.stepAmount = 1/100;
        this.terrain = terrain;
        this.callContext = callbackOnContact.context;
        this.callbackOnContact = callbackOnContact.callback;
        /**
         * This array holds list of objects that must be removed from
         * scene. Only objects that contain physic bodies pushed to
         * the array.
         */
        this.bodiesForRemove = [];

        this.collision();   
    }

    /**
     * Initiates and adds contact listener.
     * This listen all collisions between physic bodies.
     * 
     * @memberof Physics
     */
    collision(){
        // Closures for listener function.
        let bodiesForRemove = this.bodiesForRemove;
        let physics = this;
        this.listener = new Box2D.Dynamics.b2ContactListener();
        this.listener.PostSolve = function (contact, impulse) 
        {
            var bodyA = contact.GetFixtureA().GetBody().GetUserData(),
                bodyB = contact.GetFixtureB().GetBody().GetUserData();
            
            /* 
                If object is already marked for delete than ignore 
                it's collisions. This prevent multiple collisions for
                objects that should contact just one time.
            */
            for(i = 0; i < physics.bodiesForRemove.length; i++){                
                if(bodyA == physics.bodiesForRemove[i] 
                    || bodyB == physics.bodiesForRemove[i])
                    return;
            }     
            
            // If Body have contact method than call it.
            if (bodyA.contact) {
                bodyA.contact(contact, impulse)
            }
            if (bodyB.contact) {
                bodyB.contact(contact, impulse)
            }
        };
        this.world.SetContactListener(this.listener);
    }

    /**
     * Tests collision of cannonball with terrain.
     * Terrain hasn't physical body so we test collisions manually.
     * First, we check if there collision. If so call cannonball's
     * contact method, then calculate damage to Terrain and
     * 'remove' damaged pixels.
     * 
     * @param {!Cannonball} cannonball 
     * @returns 
     * @memberof Physics
     */
    terrainCollision(cannonball){
        let pos = cannonball.getCurrentPosition();
        let contact = false;        
        let cannonRadius = 3;
        let blastRadius = 25;
        /** Cannonball position in canvas coords. */
        let collPos = {
            x: Math.round(pos.x * this.scale),
            y: Math.round(pos.y * this.scale)
        }
        contact = this.terrain.checkCollision(collPos, cannonRadius);      
        
        if(!contact)
            return;
        
        cannonball.contact();        
        this.terrain.damageTerrain(collPos, blastRadius);
    }

    /**
     * Manages physical world step.
     * First remove unnecessary physical objects.
     * b2World.Step calculates physics.
     * 
     * @param {!number} dt Seconds passed from last frame.
     * @memberof Physics
     */
    step(dt){        
        this.removeObjectsFromWorld();

        this.dtRemaining = dt;
        while(this.dtRemaining > this.stepAmount) {
            this.dtRemaining -= this.stepAmount;
            this.world.Step(this.stepAmount, 
                      10, // velocity iterations
                      10);// position iterations
        }   
    }

    /**
     * Returns array of physic bodies.
     * 
     * @returns Array<b2BodyDef>
     * @memberof Physics
     */
    getBodyList(){
        return this.world.GetBodyList();
    }

    /**
     * Pushes objects that should be removed from scene in array.
     * Checks if obj is Shell this means that Shell object had
     * contact with something and we must call GameManager method
     * that handles this event. Delay in call is needed to play
     * animation of blasting Shell.
     * 
     * @param {!any} obj 
     * @memberof Physics
     */
    pushObjectForRemove(obj){
        if(obj instanceof Shell)
            setTimeout(() => this.callbackOnContact.call(this.callContext), 500);
        this.bodiesForRemove.push(obj);
    }

    /**
     * Removes unnecessary physical bodies from world.
     * 
     * @memberof Physics
     */
    removeObjectsFromWorld(){
        this.bodiesForRemove.forEach( obj => this.world.DestroyBody(obj.body) );
        this.bodiesForRemove = [];
    }

    /**
     * Removes ALL physical bodies from world.
     * 
     * @memberof Physics
     */
    destroyAllObjects(){
        let obj = this.world.GetBodyList();
        //destroy all physical bodies
        while(obj){	
            this.world.DestroyBody(obj);
            obj = obj.GetNext();
        }
    }
}