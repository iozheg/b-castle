/**
 * Manages ingame notifications.
 * When message is displayed it's font increases from 0 to font size
 * that was specified in this.show method.
 * 
 * @class SimpleNotification
 */
class SimpleNotification{
    /**
     * Creates an instance of SimpleNotification.
     * @memberof SimpleNotification
     */
    constructor(){
        this.active = false;
        this.startFontSize = 0;
    }

    /**
     * Shows message.
     * 
     * @param {!string} message Shown message.
     * @param {!number} time Time in milliseconds, shows how long
     *      message will be visible.
     * @param {!number} fontSize Max font size of message.
     * @memberof SimpleNotification
     */
    show(message, time, fontSize){
        this.active = true;
        this.message = message;
        this.fontSize = (typeof fontSize == "undefined" ? 4 : fontSize);
        setTimeout(() => this.hide(), time);
    }

    /**
     * Hides message.
     * This method call after specified time past.
     * 
     * @memberof SimpleNotification
     */
    hide(){
        this.startFontSize = 0;
        this.active = false;
    }

    /**
     * Draws notification.
     * If there no active message then skip drawing.
     * 
     * @param {!CanvasRenderingContext2D} context 
     * @param {!number} width 
     * @param {!number} scale 
     * @returns 
     * @memberof SimpleNotification
     */
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