var players = [];
var currentPlayer = "player1";
var gameInProcess = "no";
var bodiesForRemove = [];
var animations = [];
var translation = 0;
var cameraLimits = {
	left: 0,
	right: -30
}
var strength = 0;
var maxStrength = 20;
var shootButtonPressed = false;

var game = function(){
	var b2Vec2 = Box2D.Common.Math.b2Vec2;
	var b2BodyDef = Box2D.Dynamics.b2BodyDef;
	var b2Body = Box2D.Dynamics.b2Body;
	var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
	var b2Fixture = Box2D.Dynamics.b2Fixture;
	var b2World = Box2D.Dynamics.b2World;
	var b2MassData = Box2D.Collision.Shapes.b2MassData;
	var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
	var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
	var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

	var Physics = window.Physics = function(element,scale) {
		var gravity = new b2Vec2(0,9.8);
		this.world = new b2World(gravity, true);
		this.element = element;
		this.context = element.getContext("2d");
		this.scale = scale || 20;
		this.dtRemaining = 0;
		this.stepAmount = 1/60;
		this.wind = {
			force: 0,
			maxForce: 3,
			minForce: -3
		};
	};

	Physics.prototype.collision = function () {
		this.listener = new Box2D.Dynamics.b2ContactListener();
		this.listener.PostSolve = function (contact, impulse) {
			var bodyA = contact.GetFixtureA().GetBody().GetUserData(),
				bodyB = contact.GetFixtureB().GetBody().GetUserData();
			
			for(i = 0; i < bodiesForRemove.length; i++)
				if(bodyA == bodiesForRemove[i] || bodyB == bodiesForRemove[i])
					return;
					
			if (bodyA.contact && bodyA instanceof Castle) {
				bodyA.contact(contact, impulse, true)
			}
			if (bodyB.contact) {
				bodyB.contact(contact, impulse, false)
			}
	 
		};
		this.world.SetContactListener(this.listener);
	};
	
	Physics.prototype.changePlayer = function (){
		if(currentPlayer == "player1"){
			currentPlayer = "player2";
			translation = -30;
		}
		else {
			currentPlayer = "player1";
			translation = 0;
		}
		Cannonball.isOnScene = false;
		this.wind.force = parseFloat((Math.random() * (this.wind.maxForce - this.wind.minForce) + this.wind.minForce).toFixed(1));
	}
	
	Physics.prototype.keyControl = function(){
		function control(e){
			switch (e.keyCode) {
				case 32:
					if(!Cannonball.isOnScene){
					//	strengthInt = setInterval(countStrength, 80);
						shootButtonPressed = true;
					}
		
					break;
				case 38:
					if(!players[currentPlayer].angle.upperBound(players[currentPlayer].getAngle()))
						players[currentPlayer].setAngle(players[currentPlayer].angle.max);
					else
						players[currentPlayer].setAngle(players[currentPlayer].getAngle() - players[currentPlayer].angle.increment_sign * 0.03);
					break;
				case 40:
					if(!players[currentPlayer].angle.lowerBound(players[currentPlayer].getAngle()))
						players[currentPlayer].setAngle(players[currentPlayer].angle.min);
					else
						players[currentPlayer].setAngle(players[currentPlayer].getAngle() + players[currentPlayer].angle.increment_sign * 0.03);
					break;
				case 37:
					translation += 1;
					if(translation >= cameraLimits.left)
						translation = cameraLimits.left;
					break;
				case 39:
					translation -= 1;
					if(translation <= cameraLimits.right)
						translation = cameraLimits.right;
					break;
			}
		}
		function shootControl(e){
			if(e.keyCode == 32 && shootButtonPressed){
				shootButtonPressed = false;
				shoot();
				strength = 0;
			}
		}
	
		window.addEventListener("keydown", control);
		window.addEventListener("keyup", shootControl);
	}
	
	function shoot(){
		var angle = players[currentPlayer].getAngle();
		var pos = {
			x: players[currentPlayer].getPointerPosition().x + Math.cos(angle) * 2,
			y: players[currentPlayer].getPointerPosition().y + Math.sin(angle) * 2
		}
		var cannonball = new Cannonball(this.physics, {x: pos.x, y: pos.y, radius: 0.3, shape: "circle", kind: "cannonball"});
		cannonball.body.ApplyImpulse(new b2Vec2(Math.cos(angle)*strength, Math.sin(angle)*strength), cannonball.body.GetPosition());
	//	document.getElementById("info").innerHTML = " " + physics.wind.force;
		cannonball.body.ApplyForce(new b2Vec2(physics.wind.force, 0), cannonball.body.GetPosition());
	}
	
	function countStrength(){
/* 		if(shootButtonPressed)
			strength >= maxStrength ? strength = maxStrength : strength += 0.01;
		else
			clearInterval(strengthInt); */
	}
	
	Physics.prototype.debug = function() {
		this.debugDraw = new b2DebugDraw();
		this.debugDraw.SetSprite(this.context);
		this.debugDraw.SetDrawScale(this.scale);
		this.debugDraw.SetFillAlpha(0.3);
		this.debugDraw.SetLineThickness(1.0);
		this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(this.debugDraw);
	};

	Physics.prototype.step = function(dt) {
		this.dtRemaining += dt;
		while(this.dtRemaining > this.stepAmount) {
			this.dtRemaining -= this.stepAmount;
			this.world.Step(this.stepAmount, 
                      10, // velocity iterations
                      10);// position iterations
		}
		
		if(shootButtonPressed)
			strength >= maxStrength ? strength = maxStrength : strength += 0.3;
		
		while((obj = bodiesForRemove.pop())){
			this.world.DestroyBody(obj.body);
			delete obj;
		}
				
		if(this.debugDraw) {
			this.world.DrawDebugData();
		} else {
			var obj = this.world.GetBodyList();
			this.context.clearRect(0,0,this.element.width,this.element.height);

			this.context.save();
			this.context.scale(this.scale,this.scale);
			
			this.wind.force <= 0 ? direction = resources["windleft"] : direction = resources["windright"];
			
			this.context.drawImage(direction, this.element.width / (this.scale*2), 1,
					this.wind.force,
					0.8);
			
			this.context.translate(translation, 0);
			
			while(obj) {
				var body = obj.GetUserData();
				if(body) {  body.draw(this.context); }

				obj = obj.GetNext();
		  }
		  
			for(i = 0; i < animations.length; i++){
				var anim = animations.pop()
				anim.draw(this.context);
				if(!anim.stop)
					delete animations.unshift(anim);
			}
		  
		  this.context.restore();
		}
	}

	var physics,
      lastFrame = new Date().getTime();

	window.gameLoop = function() {
		var tm = new Date().getTime();
		requestAnimationFrame(gameLoop);
		var dt = (tm - lastFrame) / 1000;
		if(dt > 1/15) { dt = 1/15; }
		physics.step(dt);
		lastFrame = tm;
	};

	function init() {
		loadResources();
		physics = window.physics = new Physics(document.getElementById("b2dCanvas"));
		physics.wind.force = parseFloat((Math.random() * (physics.wind.maxForce - physics.wind.minForce) + physics.wind.minForce).toFixed(1));
		// Create some walls
	//	new Body(physics, { color: "red", type: "static", x: 0, y: 0, height: 50,  width: 0.5 });
	//	new Body(physics, { color: "red", type: "static", x:51, y: 0, height: 50,  width: 0.5});
	//	new Body(physics, { color: "red", type: "static", x: 0, y: 0, height: 0.5, width: 120 });
		new Body(physics, { color: "red", type: "static", x: 0, y:35, height: 0.5, width: 500 });
      
		players["player1"] = new Player(physics, "player1", p1nick);
		players["player2"] = new Player(physics, "player2", p2nick);
		
		physics.keyControl();
		physics.collision();
		requestAnimationFrame(gameLoop);
    };

	init();
}