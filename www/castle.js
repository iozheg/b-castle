class Castle{
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

    draw(context) {
        var pos = this.body.GetPosition(),
            angle = this.body.GetAngle();
        
        // Save the context
        context.save();
     
        // Translate and rotate
        context.translate(pos.x, pos.y);
        context.rotate(angle);
        
        // Draw the shape outline if the shape has a color
        context.drawImage(
                resources["castle"], 
                -this.details.width / 2, 
                -this.details.height / 2,
                this.details.width,
                this.details.height
            );
     
        context.restore();
    };
    
    contact(contact, impulse){
        var kind = contact.GetFixtureB().GetBody().GetUserData().details.kind;
        //check that cannonball collides castle
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