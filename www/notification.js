class SimpleNotification{
    constructor(){
        this.active = false;
        this.startFontSize = 0;
    }

    show(message, time, fontSize){
        this.active = true;
        this.message = message;
        this.fontSize = (typeof fontSize == "undefined" ? 4 : fontSize);
        setTimeout(() => this.hide(), time);
    }

    hide(){
        this.startFontSize = 0;
        this.active = false;
    }

    draw(context, width, scale){
        if(!this.active)
		    return;
		
        context.save();
        context.scale(scale, scale);
        
        
        context.fillStyle="#FF0000";
        if (this.startFontSize < this.fontSize)
            this.startFontSize += 0.5;

        context.font = this.startFontSize+"px 'Press Start 2P'";
        let xoffset = (width - context.measureText(this.message).width*scale)/2;
        context.translate(xoffset/scale, 15);
        
        context.fillText(this.message, 0, 0);
        
        context.restore();
    }
}