/**
 * Manages camera.
 * 
 * @class Camera
 */
class Camera{
    /**
     * Creates an instance of Camera.
     * @param {!HTMLCanvasElement} canvas 
     * @memberof Camera
     */
    constructor(canvas){
        /** Ratio of canvas units to physical world (scene) units. */
        this.scale = 20;
        this.gameSceneWidth = 2100; //pixels
        this.canvas = canvas;
        /** Horizontal offset that defines camera movement. */
        this.translation = 0;
        /** Min and max values of camera translation. */
        this.cameraLimits = { right: 0, left: 0};
        /** Half of camera view width. */
        this.offset = (this.canvas.width / this.scale) / 2;

        this.calculateCameraLimits();
        this.addCameraControl();
    }

    /**
     * Calculates min and max values of camera translation.
     * 
     * @memberof Camera
     */
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

    /**
     * Changes translation so it will be not out of right limit.
     * This method helpful when we change canvas width during game.
     * 
     * @memberof Camera
     */
    adjustTranslation(){
        this.translation = this.translation < this.cameraLimits.right
                    ? this.cameraLimits.right
                    : this.translation;
    }

    /**
     * Changes translation to follow object.
     * When we moving camera to right translation decreases because
     * in real we don't move camera we move scene to the left.
     * That why we multiple object position to -1.
     * this.offset - is vertical position on screen where we want
     * object to be while camera is following it. Half of camera view
     * width means that we want it in the vertical center.
     * 
     * @param {!Object} objectPosition {x, y}
     * @memberof Camera
     */
    followObject(objectPosition){
        this.translation = -objectPosition.x + this.offset;
        if(this.translation > this.cameraLimits.left)
            this.translation = this.cameraLimits.left;
        if(this.translation < this.cameraLimits.right)
            this.translation = this.cameraLimits.right;
    }

    /**
     * Moves camera to left player position.
     * 
     * @memberof Camera
     */
    setToLeftBorder(){
        this.translation = this.cameraLimits.left;
    }

    /**
     * Moves camera to right player position.
     * 
     * @memberof Camera
     */
    setToRightBorder(){
        this.translation = this.cameraLimits.right;
    }

    /**
     * Sets keyboard control to move camera right and left.
     * Move step - 1.
     * 
     * @memberof Camera
     */
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

    /**
     * Checks if object in vertical borders of scene.
     * Limits expanded to +-5. This gurantee that object will hide
     * from scene.
     * 
     * @param {!Object} objectPosition {x,y}
     * @returns true if object is on scene, false otherwise.
     * @memberof Camera
     */
    isObjectInSceneBorders(objectPosition){
        let sceneWidth = this.gameSceneWidth / 20;
        return (objectPosition.x > -5 && objectPosition.x < sceneWidth + 5);
    }
}