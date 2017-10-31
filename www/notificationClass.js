var Notification = function(context, scale){
	this.context = context;
	this.scale = scale;
	this.active = false;
}

Notification.prototype.show = function(){
	this.active = true;
}

Notification.prototype.hide = function(){
	this.active = false;
}

var SimpleNotification = function(game, context, width, scale){

//	Notification.call(this, context, scale);
	this.game = game;
	this.context = context;
	this.scale = scale;
	this.width = width;
	this.active = false;
	this.startFontSize = 0;
	
//	this.context.font="5px Comic Sans MS";
	
}

//SimpleNotification.prototype = Object.create(Notification.prototype);
//SimpleNotification.prototype.constructor = SimpleNotification;

SimpleNotification.prototype.show = function(message, time, fontSize){
	this.active = true;
	this.message = message;
	this.fontSize = (typeof fontSize == "undefined" ? 4 : fontSize);
//	log(this.fontSize);
	setTimeout(function(){this.game.notification.hide()}, time);
}

SimpleNotification.prototype.hide = function(){
	this.startFontSize = 0;
	this.active = false;
}

SimpleNotification.prototype.draw = function(){

	if(!this.active)
		return;
		
	this.context.save();
	this.context.scale(this.scale, this.scale);
	
	
	this.context.fillStyle="#FF0000";
	if (this.startFontSize < this.fontSize)
		this.startFontSize += 0.5;
//	log(this.startFontSize);
	this.context.font = this.startFontSize+"px 'Press Start 2P'";
	this.xoffset = (this.width - this.context.measureText(this.message).width*this.scale)/2;
	this.context.translate(this.xoffset/this.scale, 15);
	
	this.context.fillText(this.message, 0, 0);
	
	this.context.restore();
	
}