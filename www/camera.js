class Camera{
    constructor(canvas){
        this.scale = 20;
        this.gameSceneWidth = 2100;
        this.canvas = canvas;
        this.translation = 0;
        this.cameraLimits = { right: 0, left: 0};

        this.calculateCameraLimits();
        this.addCameraControl();
    }

    calculateCameraLimits(){
        let windowWidth = window.innerWidth 
                || document.documentElement.clientWidth;
        this.cameraLimits.right = 
            (windowWidth - this.gameSceneWidth)
            / this.scale;
        if(this.cameraLimits.right >= 0)
        this.cameraLimits.right = -1;

        this.cameraLimits.left = 0;

        // width - canvas width = camera view width
        // width / scale - horizontal dimention of scene 
        // (convert canvas coords to scene coords).
        // /2 - get center of camera view
        this.offset = (this.canvas.width / this.scale) / 2;
    }

    adjustTranslation(){
        this.translation = this.translation < this.cameraLimits.right
                    ? this.cameraLimits.right
                    : this.translation;
    }

    followObject(objectPosition){
        this.translation = -objectPosition.x + this.offset;
        if(this.translation > this.cameraLimits.left)
            this.translation = this.cameraLimits.left;
        if(this.translation < this.cameraLimits.right)
            this.translation = this.cameraLimits.right;
    }

    setToLeftBorder(){
        this.translation = this.cameraLimits.left;
    }

    setToRightBorder(){
        this.translation = this.cameraLimits.right;
    }

    addCameraControl(){
        this.control = function(e){
            if(e.keyCode == 37){
                camera.translation += 1;
                if(camera.translation > camera.cameraLimits.left)
                    camera.translation = camera.cameraLimits.left;
            } else if( e.keyCode == 39){
                camera.translation -= 1;
                if(camera.translation < camera.cameraLimits.right)
                    camera.translation = camera.cameraLimits.right;
            }
        }
        window.addEventListener("keydown", this.control);
    }
}