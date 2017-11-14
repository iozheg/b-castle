/**
 * Manages graphical component of the game.
 * Draws physical objects to context.
 * Buffering is used.
 * 
 * @class Graphics
 */
class Graphics{
    /**
     * Creates an instance of Graphics.
     * @param {!HTMLCanvasElement} canvas 
     * @param {!number} scale 
     * @param {!Object} cameraLimits 
     * @memberof Graphics
     */
    constructor(canvas, scale, cameraLimits){
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.buffer = document.createElement("canvas");
        this.buffer.ctx = this.buffer.getContext("2d");
        this.buffer.width = parseInt((
            this.canvas.currentStyle 
            || window.getComputedStyle(this.canvas)).width
        );
        this.buffer.height = parseInt((
            this.canvas.currentStyle 
            || window.getComputedStyle(this.canvas)).height
        );

        this.scale = scale;
    }

    /**
     * Draws wind direction, physical objects, animation.
     * 
     * @param {!Array<Object>} bodyList 
     * @param {!number} windForce 
     * @param {!number} translation 
     * @memberof Graphics
     */
    draw(bodyList, windForce, translation){
        this.buffer.ctx.save();
        this.buffer.ctx.scale(this.scale, this.scale);
        
        let direction = windForce <= 0
                            ? resources["windleft"]
                            : resources["windright"];
                            this.buffer.ctx.drawImage(
                                direction,
                                this.buffer.width / (this.scale*2),
                                3,
                                Math.abs(windForce),
                                0.8
                            );

        this.buffer.ctx.translate(translation, 0);
        let obj = bodyList;
        while(obj) {
            let body = obj.GetUserData();
            if(body) {
                body.draw(this.buffer.ctx);
            }
            obj = obj.GetNext();
        }    

        for(i = 0; i < animations.length; i++){
            var anim = animations.pop();
            anim.draw(this.buffer.ctx);
            if(!anim.stop)
                delete animations.unshift(anim);
        }

        this.buffer.ctx.restore();
    }

    /**
     * Clears buffer context.
     * 
     * @memberof Graphics
     */
    clearBuffer(){
        this.buffer.ctx.clearRect(
            0,0,this.buffer.width, this.buffer.height
        );
    }

    /**
     * Clears main context.
     * 
     * @memberof Graphics
     */
    clearMainContext(){
        this.context.clearRect(
            0,0,this.buffer.width, this.buffer.height
        );
    }

    /**
     * Draws buffer to main context.
     * 
     * @memberof Graphics
     */
    drawBuffer(){
        this.context.drawImage(this.buffer, 0, 0);
    }
}