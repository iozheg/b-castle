/**
 * Manages terrain object.
 * 
 * Terrain is ImageData object. It is array of numbers that contains
 * r, g, b, a components of every pixel. That's why every row size of
 * image equals image's width * 4.
 * Terrain's image width less than game scene's width because we need
 * also place player's on scene. Half of the difference between width
 * of terrain and width of scene called here 'offset'. This is the
 * value of the offset from the beginning of the scene where terrain
 * begins to draw.
 * 
 * @class Terrain
 */
class Terrain{
    /**
     * Creates an instance of Terrain.
     * @param {!CanvasRenderingContext2D} context 
     * @param {!Array<number>} terrainLine Array of numbers that
     *      defines one-dimensional height map .
     * @memberof Terrain
     */
    constructor(context, terrainLine){
        this.width = 1800;
        this.height = 700;
        this.offset = 150;
        this.rowCapacity = this.width * 4;
        this.imgData = context.createImageData(this.width, this.height);
        /** Used to draw to canvas. */
        this.imageBitmap = null;
        
        this.terrainLine = new Array(terrainLine.length);
        this.terrainLine = terrainLine;
        //we have to fill whole imgData massive using terrain line
        this.fillTerrain();

        createImageBitmap(this.imgData)
            .then(bitmap => this.imageBitmap = bitmap);
    }

    /**
     * Fills terrain.imgData array accordingly height map.
     * In depending of height pixels change their color: the higher is
     * whiter, lower - greener.
     * 
     * @memberof Terrain
     */
    fillTerrain(){
        let peakColor = 230; 	// defines color of terrain's peaks
        let bottomColor = 165; 	// color for the terrain bottom
        /** Ratio of terrain heigth to total height. */
        let heightCoef = 0;

        for (let i = 0; i < this.terrainLine.length; i++) {
            /** index - position of pixel in terrain.imgData array.
            * In ImageData first elements are top of image, last -
            * bottom, so to find desired row we must substruct
            * height value of terrainLine from total image height.
            * i*4 - horizontal pixel position.
            */
            let index = (this.height - this.terrainLine[i])
                        * this.rowCapacity + i*4;
            if(i%5==0)
                heightCoef = this.terrainLine[i] / this.height;
            /** Base color of highest pixel in current column. */
            let color = {
                r: peakColor * heightCoef,
                g: heightCoef * (peakColor-bottomColor) + bottomColor,
                b: peakColor * heightCoef
            }
            
            this.imgData.data[index +0] = color.r;
            this.imgData.data[index +1] = color.g;
            this.imgData.data[index +2] = color.b;
            this.imgData.data[index +3] = 255;
            
            /** Fill all pixels under the highest in current column. */
            for(let j = 1; j < this.terrainLine[i]; j++){ 	
                index = index + this.rowCapacity;
                /** First five pixels in current column have same
                 * color as highest.
                 */
                if(j < 5){
                    this.imgData.data[index +0] = color.r;
                    this.imgData.data[index +1] = color.g;
                    this.imgData.data[index +2] = color.b;
                    this.imgData.data[index +3] = 255;
                } else{
                    let internalHeightCoef = (this.terrainLine[i]-j
                                                + Math.random()*10)
                                                / this.height;
                    this.imgData.data[index +0] = peakColor 
                                                    * internalHeightCoef;
                    this.imgData.data[index +1] = internalHeightCoef
                                                    * (peakColor-bottomColor)
                                                    + bottomColor;
                    this.imgData.data[index +2] = peakColor
                                                    * internalHeightCoef;
                    this.imgData.data[index +3] = 255;
                }
            }
        }
    }

    /**
     * Checks if object collides with terrain.
     * 
     * @param {!any} objPosition 
     * @param {!number} objRadius 
     * @returns false if no collision, otherwise true.
     * @memberof Terrain
     */
    checkCollision(objPosition, objRadius){
        let objPosOnTerrain = {
            x: objPosition.x - this.offset,
            y: objPosition.y
        }

        /** If object is out of terrain then there no collision. */
        if(
            objPosOnTerrain.x <= 0 || objPosOnTerrain.x >= this.width 
            || objPosOnTerrain.y <=0 || objPosOnTerrain.y >= this.height
        )
            return false;
        
        /** To detect collision we check intersection of circle with
         * terrain. objRadius is circle radius, objPosOnTerrain -circle
         * center position.
         * First calculate position of every pixel of circle using
         * formula:
         * (y-y0)^2 + (x-x0)^2 = R^2 => 
         *          y1 = y0 + sqrt(R^2 - (x-x0)^2)
         *      and y2 = y0 - sqrt(R^2 - (x-x0)^2),
         * x0 and y0 - center of circle, R - radius.
         * For every circle's pixel calculate index in terrain array.
         * Then check if terrain pixel with this index is 'exists',
         * that means that it's alpha component must be equal 255.
         * So if any pixel of circle intersects terrain than we have
         * contact and we can stop further checking.
        */
        for(let x = -1 * objRadius + objPosOnTerrain.x; 
            x <= objRadius + objPosOnTerrain.x; 
            x++)
        {
            let sqrt = Math.sqrt(
                Math.pow(objRadius, 2) - Math.pow(x - (objPosOnTerrain.x), 2)
            );
            let y1 = objPosOnTerrain.y + (sqrt)>>0;
            let y2 = objPosOnTerrain.y - (sqrt)>>0;

            let index = y1 * this.rowCapacity + x * 4;
            if(this.imgData.data[index +3] == 255){
                return true;
            }            
            index = y2 * this.rowCapacity + x * 4;
            if(this.imgData.data[index +3] == 255){
                return true;
            }
        }

        return false;
    }

    /**
     * Makes damage to terrain.
     * We take circle with radius blastRadius and center in
     * blastPosition and 'cut' it from terrain. This means that we
     * make invisible all terrain pixels that lie in and on the
     * circle, setting their alpha component to 0.
     * All math equal to collision detection.
     * 
     * @param {!Object} blastPosition {x, y}
     * @param {!number} blastRadius 
     * @memberof Terrain
     */
    damageTerrain(blastPosition, blastRadius){
        let blastPosOnTerrain = {
            x: blastPosition.x - this.offset,
            y: blastPosition.y
        }

        for(let x = -1 * blastRadius + blastPosOnTerrain.x; 
            x <= blastRadius + blastPosOnTerrain.x; 
            x++)
        {
            let sqrt = Math.sqrt(
                Math.pow(blastRadius, 2) - Math.pow(x - (blastPosOnTerrain.x), 2)
            );
        
            let y1 = blastPosOnTerrain.y + (sqrt)>>0;
            let y2 = blastPosOnTerrain.y - (sqrt)>>0;
            
            let index = y1 * this.rowCapacity + x * 4;
            let index2 = y2 * this.rowCapacity + x * 4;
            /** When collision happens on left or right border of
             * terrain due to terrain stored in array some part of
             * explosion will be transfered on opposite border.
             * To prevent this we make checks:
             */
            if(index < y1 * this.rowCapacity ||
                index2 >= (y2+1) * this.rowCapacity)
                continue;
    
            for(let i = index2; i <=index; ){
                this.imgData.data[i +3] = 0;
                i = i + this.rowCapacity;
            }
                
        }
        
        /** Redraw bitmap. */
        this.redrawTerrain();
    }

    /**
     * Redraws terrain's bitmap.
     * Redrawing is needed after every terrain change.
     * 
     * @memberof Terrain
     */
    redrawTerrain(){
        createImageBitmap(this.imgData)
            .then(bitmap => this.imageBitmap = bitmap);
    }

    /**
     * Draws terrain bitmap to context.
     * 
     * @param {!CanvasRenderingContext2D} context 
     * @param {!number} scale 
     * @param {!number} translation 
     * @memberof Terrain
     */
    draw(context, scale, translation){        
    //    console.time("Drawing terrain...");
        context.save();
        context.drawImage(this.imageBitmap, translation * scale + this.offset, 0);
    //    context.putImageData(this.imgData, translation * scale + 150, 0);
        context.restore();        
    //    console.timeEnd("Drawing terrain...");       
    }
}