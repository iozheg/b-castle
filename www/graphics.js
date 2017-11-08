class Graphics{
    constructor(canvas, scale, cameraLimits){
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.buffer = document.createElement("canvas"); //for buffering
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

    draw(bodyList, windForce){
        this.buffer.ctx.save();
        this.buffer.ctx.scale(this.scale, this.scale);
        
        //show wind direction
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
        
        //draw objects
        this.buffer.ctx.translate(translation, 0);
        let obj = bodyList;
        while(obj) {
            let body = obj.GetUserData();
            if(body) {
                body.draw(this.buffer.ctx);
            }
            obj = obj.GetNext();
        }    
        
        //draw animations
        for(i = 0; i < animations.length; i++){
            var anim = animations.pop();
            anim.draw(this.buffer.ctx);
            if(!anim.stop)
                delete animations.unshift(anim);
        }
          
        this.buffer.ctx.restore();
    }

    clearBuffer(){
        this.buffer.ctx.clearRect(
            0,0,this.buffer.width, this.buffer.height
        );
    }

    clearMainContext(){
        this.context.clearRect(
            0,0,this.buffer.width, this.buffer.height
        );
    }

    drawBuffer(){
        this.context.drawImage(this.buffer, 0, 0);
    }
}