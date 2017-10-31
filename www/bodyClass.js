var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;


var Body = window.Body = function (physics, details) {
	
    this.details = details = details || {};
 
    // Create the definition
    this.definition = new b2BodyDef();
 
    // Set up the definition
    for (var k in this.definitionDefaults) {
        this.definition[k] = details[k] || this.definitionDefaults[k];
    }
    this.definition.position = new b2Vec2(details.x || 0, details.y || 0);
    this.definition.linearVelocity = new b2Vec2(details.vx || 0, details.vy || 0);
    this.definition.userData = this;
    this.definition.type = details.type == "static" ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
	this.definition.kind = details.kind || null;
 
    // Create the Body
    this.body = physics.world.CreateBody(this.definition);
 
    // Create the fixture
    this.fixtureDef = new b2FixtureDef();
    for (var l in this.fixtureDefaults) {
        this.fixtureDef[l] = details[l] || this.fixtureDefaults[l];
    }
 
 
    details.shape = details.shape || this.defaults.shape;
 
    switch (details.shape) {
        case "circle":
            details.radius = details.radius || this.defaults.radius;
            this.fixtureDef.shape = new b2CircleShape(details.radius);
            break;
        case "polygon":
            this.fixtureDef.shape = new b2PolygonShape();
            this.fixtureDef.shape.SetAsArray(details.points, details.points.length);
            break;
        case "block":
        default:
            details.width = details.width || this.defaults.width;
            details.height = details.height || this.defaults.height;
 
            this.fixtureDef.shape = new b2PolygonShape();
            this.fixtureDef.shape.SetAsBox(details.width / 2,
            details.height / 2);
            break;
    }
 
    this.body.CreateFixture(this.fixtureDef);
	
	
};
 
 
Body.prototype.defaults = {
    shape: "block",
    width: 5,
    height: 5,
    radius: 2.5
};
 
Body.prototype.fixtureDefaults = {
    density: 2,
    friction: 1,
    restitution: 0.2,
};
 
Body.prototype.definitionDefaults = {
    active: true,
    allowSleep: true,
    angle: 0,
    angularVelocity: 0,
    awake: true,
    bullet: false,
    fixedRotation: false
};

Body.prototype.draw = function (physics) {
    var pos = this.body.GetPosition(),
        angle = this.body.GetAngle();
 
    // Save the context
	physics.context.save();
 
    // Translate and rotate
    physics.context.translate(pos.x, pos.y);
    physics.context.rotate(angle);
 
 
    // Draw the shape outline if the shape has a color
    if (this.details.color) {
        physics.context.fillStyle = this.details.color;
 
        switch (this.details.shape) {
            case "circle":
                physics.context.beginPath();
                physics.context.arc(0, 0, this.details.radius, 0, Math.PI * 2);
                physics.context.fill();
                break;
            case "polygon":
                var points = this.details.points;
                physics.context.beginPath();
                physics.context.moveTo(points[0].x, points[0].y);
                for (var i = 1; i < points.length; i++) {
                    physics.context.lineTo(points[i].x, points[i].y);
                }
                physics.context.fill();
                break;
            case "block":
                physics.context.fillRect(-this.details.width / 2, -this.details.height / 2,
                this.details.width,
                this.details.height);
            default:
                break;
        }
    }
 
    // If an image property is set, draw the image.
    if (this.details.image) {
        physics.context.drawImage(this.details.image, -this.details.width / 2, -this.details.height / 2,
        this.details.width,
        this.details.height);
 
    }
/* 	if(this.details.kind == "cannonball"){
		context.drawImage(imgCannonball, -this.details.radius, -this.details.radius,
        this.details.radius*2,
        this.details.radius*2);
	} */
 
    physics.context.restore();
 
};

Body.prototype.destroy = function(){
	this.body.GetWorld().DestroyBody(this.body);
};