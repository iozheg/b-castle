var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

class Physics{
    constructor(scale=20, maxStrength){
        var gravity = new b2Vec2(0,9.8);
        this.world = new b2World(gravity, true);
        this.scale = scale;
        this.dtRemaining = 0;
        this.stepAmount = 1/100;
        this.maxStrength = maxStrength;
    }

    collision(){
        this.listener = new Box2D.Dynamics.b2ContactListener();
        this.listener.PostSolve = function (contact, impulse) {
            var bodyA = contact.GetFixtureA().GetBody().GetUserData(),
                bodyB = contact.GetFixtureB().GetBody().GetUserData();
            
            for(i = 0; i < bodiesForRemove.length; i++){
                //if object is already marked for delete 
                //than ignore it's collisions
                if(bodyA == bodiesForRemove[i] || bodyB == bodiesForRemove[i])
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
        var pos = cannonball.body.GetPosition();
        var contact = false;
        var blastRadius = 25;
        var diff = 150; //terrain offset from beginning of canvas
        var cannonRadius = 3;
        var collPos = {
            x: Math.round(pos.x * this.scale) - diff,
            y: Math.round(pos.y * this.scale)
        }
        
        if(collPos.x <= 0 
            || collPos.x >= gamemanager.game.terrain.width 
            || collPos.y <=0 
            || collPos.y >= gamemanager.game.terrain.height)
            return;
            	
        for(let x = -1 * cannonRadius + collPos.x; x <= cannonRadius + collPos.x; x++){
            let y = collPos.y + (Math.sqrt(Math.pow(cannonRadius, 2) - Math.pow(x - (collPos.x), 2)))>>0; //y0 + sqrt(R^2 - (x-x0)^2)
            let y2 = collPos.y - (Math.sqrt(Math.pow(cannonRadius, 2) - Math.pow(x - (collPos.x), 2)))>>0;			//y0 - sqrt(R^2 - (x-x0)^2)
            let index = y * gamemanager.game.terrain.rowCapacity + x * 4;
            if(gamemanager.game.terrain.imgData.data[index +3] == 255){
                contact = true;
                break;
            }
            
            index = y2 * gamemanager.game.terrain.rowCapacity + x * 4;
            if(gamemanager.game.terrain.imgData.data[index +3] == 255){
                contact = true;
                break;
            }
        }
        
        if(!contact)
            return;
        
        cannonball.contact();
    
        for(let x = -1 * blastRadius + collPos.x; x <= blastRadius + collPos.x; x++){
            let y = collPos.y + (Math.sqrt(Math.pow(blastRadius, 2) - Math.pow(x - (collPos.x), 2)))>>0; //y0 + sqrt(R^2 - (x-x0)^2)
            let y2 = collPos.y - (Math.sqrt(Math.pow(blastRadius, 2) - Math.pow(x - (collPos.x), 2)))>>0;//y0 - sqrt(R^2 - (x-x0)^2)
            
            
            let index = y * gamemanager.game.terrain.rowCapacity + x * 4;
            let index2 = y2 * gamemanager.game.terrain.rowCapacity + x * 4;
            if(index < y * gamemanager.game.terrain.rowCapacity)
                continue;
    
            for(let i = index2; i <=index; ){
                gamemanager.game.terrain.imgData.data[i +3] = 0;
                i = i + gamemanager.game.terrain.rowCapacity;
            }
                
        }
    }

    step(dt){
        this.dtRemaining = dt;
        while(this.dtRemaining > this.stepAmount) {
            this.dtRemaining -= this.stepAmount;
            this.world.Step(this.stepAmount, 
                      10, // velocity iterations
                      10);// position iterations
        }
        
        if(shootButtonPressed){
            strength >= this.maxStrength 
            ? strength = this.maxStrength 
            : strength += 0.3;
        }
    }

    getBodyList(){
        return this.world.GetBodyList();
    }

    destroyObjects(){
        let obj = this.world.GetBodyList();
        while(obj){	//destroy all physical bodies
            this.world.DestroyBody(obj);
            obj = obj.GetNext();
        }
    }
}