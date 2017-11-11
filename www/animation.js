class Animation{
    constructor(type, position, height, width, frames, repeat){
        this.initialImage = resources[type];
        
        this.posX = position.x; //position on canvas
        this.posY = position.y;
        this.height = height;
        this.width = width;
        
        this.step = 0;
        this.frames = frames;
        this.repeat = repeat;
        this.speed = 2;
        this.currentFrame = 0;
        
        this.stop = false;

        window.animations.push(this);
    }

    draw(context){
        // Save the context
        context.save();
    
       // Translate and rotate
       context.translate(this.posX, this.posY);
       context.rotate(0);
       
       context.drawImage(this.initialImage, 
                       39 * this.step,
                       0,
                       39,
                       40,
                       -this.width/2,
                       -this.height/2,
                       this.width,
                       this.height);
       context.restore();
       
       this.currentFrame++;
       
       if(this.currentFrame == this.speed){
           this.currentFrame = 0;
           this.step++;
       }
       if(this.step == this.frames && this.repeat)
           this.step = 0;
       else if(this.step == this.frames){
           this.stop = true;
       }
    }
}