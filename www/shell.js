var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

class Shell{
    constructor(world, details){
        
        // Create the definition
        this.definition = new b2BodyDef(); 
        // Set up the definition
        for (var k in Shell.definitionDefaults) {
            this.definition[k] = details[k] || Shell.definitionDefaults[k];
        }
        this.definition.position = new b2Vec2(details.x || 0, details.y || 0);
        this.definition.linearVelocity = new b2Vec2(
                                        details.vx || 0, 
                                        details.vy || 0
                                    );
        this.definition.userData = this;
        this.definition.type = details.type == "static" 
                            ? b2Body.b2_staticBody 
                            : b2Body.b2_dynamicBody;
        this.definition.kind = details.kind || null;
    
        // Create the Body
        this.body = world.CreateBody(this.definition);
    
        // Create the fixture
        this.fixtureDef = new b2FixtureDef();
        for (var l in Shell.fixtureDefaults) {
            this.fixtureDef[l] = details[l] || Shell.fixtureDefaults[l];
        }
        let shape = details.shape || Shell.detailDefaults.shape;    
        switch (shape) {
            case "circle":
                details.radius = details.radius || Shell.detailDefaults.radius;
                this.fixtureDef.shape = new b2CircleShape(details.radius);
                break;
            case "polygon":
                this.fixtureDef.shape = new b2PolygonShape();
                this.fixtureDef.shape.SetAsArray(
                                    details.points, 
                                    details.points.length
                                );
                break;
            case "block":
            default:
                details.width = details.width || Shell.detailDefaults.width;
                details.height = details.height || Shell.detailDefaults.height;
    
                this.fixtureDef.shape = new b2PolygonShape();
                this.fixtureDef.shape.SetAsBox(
                                    details.width / 2,
                                    details.height / 2
                                );
                break;
        }
    
        this.body.CreateFixture(this.fixtureDef);
    }

    static get detailDefaults(){
        return {
            shape: "block",
            width: 5,
            height: 5,
            radius: 2.5
        }
    }

    static get fixtureDefaults(){
        return {
            density: 2,
            friction: 1,
            restitution: 0.2
        }
    }

    static get definitionDefaults(){
        return {
            active: true,
            allowSleep: true,
            angle: 0,
            angularVelocity: 0,
            awake: true,
            bullet: false,
            fixedRotation: false
        }
    }
}