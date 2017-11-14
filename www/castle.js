/**
 * Manages physic body of player's castle.
 * Castle responsible for physical object and sprite. It 'represents'
 * player on scene. It handles all collisions and can be damaged.
 * 
 * @class Castle
 */
class Castle{
    /**
     * Creates an instance of Castle.
     * @param {!Physics} physics 
     * @param {!Object} details Physic body properties: position,
     *      image, dimentions.
     * @param {!string} playerIdentity 
     * @param {!string} playerNick 
     * @memberof Castle
     */
    constructor(physics, details, playerIdentity, playerNick){
        this.playerIdentity = playerIdentity;
        this.playerNick = playerNick;        
        this.details = details;
     
        // Create the definition
        this.definition = new b2BodyDef();
        // Set up the definition
        for (let k in Body.prototype.definitionDefaults) {
            this.definition[k] = details[k] 
                                || Body.prototype.definitionDefaults[k];
        }
        this.definition.position = new b2Vec2(details.x, details.y);
        this.definition.userData = this;
        this.definition.type = b2Body.b2_dynamicBody;
     
        // Create the Body
        this.body = physics.world.CreateBody(this.definition);
     
        // Create the fixture
        this.fixtureDef = new b2FixtureDef();
        for (let l in Body.prototype.fixtureDefaults) {
            this.fixtureDef[l] = details[l] 
                                || Body.prototype.fixtureDefaults[l];
        }
        this.fixtureDef.shape = new b2PolygonShape();
        this.fixtureDef.shape.SetAsBox(
                    this.details.width / 2,
                    this.details.height / 2
                );     
        this.body.CreateFixture(this.fixtureDef);
    }

    /**
     * Draws castle to context.
     * 
     * @param {!CanvasRenderingContext2D} context 
     * @memberof Castle
     */
    draw(context) {
        let pos = this.body.GetPosition(),
            angle = this.body.GetAngle();
        
        context.save();
        context.translate(pos.x, pos.y);
        context.rotate(angle);

        context.drawImage(
                resources["castle"], 
                -this.details.width / 2, 
                -this.details.height / 2,
                this.details.width,
                this.details.height
            );
     
        context.restore();
    };
    
    
    /**
     * Handles contact event.
     * If castle contacted with cannonball than send signal to server.
     * 
     * @param {!Box2D Object} contact 
     * @param {!Box2D Object} impulse 
     * @memberof Castle
     */
    contact(contact, impulse){
        let kind = contact.GetFixtureB().GetBody().GetUserData().details.kind;
        if(kind == "cannonball"){ 
            gamemanager.messageHandler.sendMessage(
                        "gamemsg", 
                        "hit", 
                        {
                            "player":this.playerIdentity
                        }
                    );
        }
    }
}