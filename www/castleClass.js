var Castle = function(physics, details, playerIdentity, playerNick){
	this.castleHP = 100;
	this.playerIdentity = playerIdentity;
	this.playerNick = playerNick;
	
	this.details = details = details || {};
 
    // Create the definition
    this.definition = new b2BodyDef();
 
    // Set up the definition
    for (var k in Body.prototype.definitionDefaults) {
        this.definition[k] = details[k] 
                            || Body.prototype.definitionDefaults[k];
    }
    this.definition.position = new b2Vec2(details.x || 0, details.y || 0);
    this.definition.linearVelocity = new b2Vec2(
                                    details.vx || 0,
                                    details.vy || 0
                                );
    this.definition.userData = this;
    this.definition.type = b2Body.b2_dynamicBody;
	this.definition.kind = details.kind || null;
 
    // Create the Body
    this.body = physics.world.CreateBody(this.definition);
 
    // Create the fixture
    this.fixtureDef = new b2FixtureDef();
    for (var l in Body.prototype.fixtureDefaults) {
        this.fixtureDef[l] = details[l] || Body.prototype.fixtureDefaults[l];
    }
  
    details.shape = details.shape || Body.prototype.defaults.shape;
 
    switch (details.shape) {
        case "polygon":
            this.fixtureDef.shape = new b2PolygonShape();
            this.fixtureDef.shape.SetAsArray(
                            details.points, 
                            details.points.length
                        );
            break;
        case "block":
        default:
            details.width = details.width || Body.prototype.defaults.width;
            details.height = details.height || Body.prototype.defaults.height;
 
            this.fixtureDef.shape = new b2PolygonShape();
            this.fixtureDef.shape.SetAsBox(details.width / 2,
            details.height / 2);
            break;
    }
 
    this.body.CreateFixture(this.fixtureDef);
}

Castle.prototype.draw = function (context) {
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

Castle.prototype.contact = function(contact, impulse){
	var kind = contact.GetFixtureB().GetBody().GetUserData().details.kind;
	if(kind == "cannonball" && this.castleHP > 0){ //check that cannonball collides castle
		conn.send("gamemsg", "hit", {"player":this.playerIdentity});
	}
}