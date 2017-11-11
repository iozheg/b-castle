var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

class Physics{
    constructor(scale, maxStrength, terrain, callbackOnContact){
        let gravity = new b2Vec2(0,9.8);
        this.world = new b2World(gravity, true);
        this.scale = scale;
        this.dtRemaining = 0;
        this.stepAmount = 1/100;
        this.maxStrength = maxStrength;
        this.terrain = terrain;
        this.callContext = callbackOnContact.context;
        this.callbackOnContact = callbackOnContact.callback;
        this.bodiesForRemove = [];

    //    this.isShellContacted = false;

        this.collision();   
    }

    collision(){
        let bodiesForRemove = this.bodiesForRemove;
        let physics = this;
        this.listener = new Box2D.Dynamics.b2ContactListener();
        this.listener.PostSolve = function (contact, impulse) 
        {
            var bodyA = contact.GetFixtureA().GetBody().GetUserData(),
                bodyB = contact.GetFixtureB().GetBody().GetUserData();
            
            for(i = 0; i < physics.bodiesForRemove.length; i++){
                //if object is already marked for delete 
                //than ignore it's collisions
                if(bodyA == physics.bodiesForRemove[i] 
                    || bodyB == physics.bodiesForRemove[i])
                    return;
            }
                    
            if (bodyA.contact && bodyA instanceof Castle) {
                bodyA.contact(contact, impulse, true)
            }
            if (bodyB.contact) {
                bodyB.contact(contact, impulse, false)
            }
        };
        this.world.SetContactListener(this.listener);
    }

    terrainCollision(cannonball){
        let pos = cannonball.body.GetPosition();
        let contact = false;
        let blastRadius = 25;
        let diff = 150; //terrain offset from beginning of canvas
        let cannonRadius = 3;
        let collPos = {
            x: Math.round(pos.x * this.scale) - diff,
            y: Math.round(pos.y * this.scale)
        }
        
        if(
            collPos.x <= 0 
            || collPos.x >= this.terrain.width 
            || collPos.y <=0 
            || collPos.y >= this.terrain.height
        )
            return;
            	
        for(let x = -1 * cannonRadius + collPos.x; x <= cannonRadius + collPos.x; x++){
            let y = collPos.y + (
                            Math.sqrt(
                                Math.pow(cannonRadius, 2) - Math.pow(x - (collPos.x), 2)
                            )
                        )>>0; //y0 + sqrt(R^2 - (x-x0)^2)
            let y2 = collPos.y - (
                            Math.sqrt(
                                Math.pow(cannonRadius, 2) - Math.pow(x - (collPos.x), 2)
                            )
                        )>>0;			//y0 - sqrt(R^2 - (x-x0)^2)
            let index = y * this.terrain.rowCapacity + x * 4;
            if(this.terrain.imgData.data[index +3] == 255){
                contact = true;
                break;
            }
            
            index = y2 * this.terrain.rowCapacity + x * 4;
            if(this.terrain.imgData.data[index +3] == 255){
                contact = true;
                break;
            }
        }
        
        if(!contact)
            return;
        
        cannonball.contact();        
    
        for(let x = -1 * blastRadius + collPos.x; x <= blastRadius + collPos.x; x++){
            let y = collPos.y + (
                        Math.sqrt(
                            Math.pow(blastRadius, 2) - Math.pow(x - (collPos.x), 2)
                        )
                    )>>0; //y0 + sqrt(R^2 - (x-x0)^2)
            let y2 = collPos.y - (
                        Math.sqrt(
                            Math.pow(blastRadius, 2) - Math.pow(x - (collPos.x), 2)
                        )
                    )>>0;//y0 - sqrt(R^2 - (x-x0)^2)
            
            let index = y * this.terrain.rowCapacity + x * 4;
            let index2 = y2 * this.terrain.rowCapacity + x * 4;
            if(index < y * this.terrain.rowCapacity)
                continue;
    
            for(let i = index2; i <=index; ){
                this.terrain.imgData.data[i +3] = 0;
                i = i + this.terrain.rowCapacity;
            }
                
        }

        this.terrain.redrawTerrain();
    }

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

    getBodyList(){
        return this.world.GetBodyList();
    }

    pushObjectForRemove(obj){
        if(obj instanceof Shell)
            setTimeout(() => this.callbackOnContact.call(this.callContext), 500);
        this.bodiesForRemove.push(obj);
    }

    removeObjectsFromWorld(){
        // while((obj = this.bodiesForRemove.pop())){
        //     this.world.DestroyBody(obj.body);
        //     // if(obj instanceof Shell)
        //     //     setTimeout(function(){gamemanager.turnEnd()}, 500); 
        //     delete obj;
        // }

        this.bodiesForRemove.forEach( obj => this.world.DestroyBody(obj.body) );
        this.bodiesForRemove = [];
    }

    destroyAllObjects(){
        let obj = this.world.GetBodyList();
        //destroy all physical bodies
        while(obj){	
            this.world.DestroyBody(obj);
            obj = obj.GetNext();
        }
    }
}