class Terrain{
    constructor(context, terrainLine){
        this.width = 1800;
        this.height = 700;
        this.offset = 150;
        //every pixel of imgData contains 4 components: r, g, b, a
        this.rowCapacity = this.width * 4;
        this.imgData = context.createImageData(this.width, this.height);
        this.imageBitmap = null;
        
        this.terrainLine = new Array(terrainLine.length);
        this.terrainLine = terrainLine;
        //we have to fill whole imgData massive using terrain line
        this.fillTerrain();

        createImageBitmap(this.imgData)
            .then(bitmap => this.imageBitmap = bitmap);
    }

    fillTerrain(){
        let peakColor = 230; 	// defines color of terrain's peaks
        let bottomColor = 165; 	// color for the terrain bottom
        let heightCoef = 0;
        // fill terrain
        for (let i = 0; i < this.terrainLine.length; i++) {
            // (this.height - this.terrainLine[i]) 	
            // - height of current pixel (or row of the current pixel)
            let index = (this.height - this.terrainLine[i]) 
                        * this.rowCapacity + i*4; 	
            // (this.height - this.terrainLine[i]) * this.rowCapacity 	
            // - this.imgData.data is linear so this is offset because of 
            // pixel's height (vertical position)            
            // it's color in addiction to it's height
            // i*4 - offset because of horizontal position of pixel

            // defines factor of how pixel of terrain changes 
            if(i%5==0)
                heightCoef = this.terrainLine[i] / this.height; 
                    
            let color = { 	// define color for terrain pixels
                r: peakColor * heightCoef,
                g: heightCoef * (peakColor-bottomColor) + bottomColor,
                b: peakColor * heightCoef
            }
            
            this.imgData.data[index +0] = color.r;
            this.imgData.data[index +1] = color.g;
            this.imgData.data[index +2] = color.b;
            this.imgData.data[index +3] = 255;
            
            // fill all pixel under surface
            // iterating all pixels under current
            for(let j = 1; j < this.terrainLine[i]; j++){ 	
                index = index + this.rowCapacity;	    
                if(j < 5){
                    this.imgData.data[index +0] = color.r;
                    this.imgData.data[index +1] = color.g;
                    this.imgData.data[index +2] = color.b;
                    this.imgData.data[index +3] = 255;
                }
                else{
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

    damageTerrain(blastPosition, blastRadius){
        let blastPosOnTerrain = {
            x: blastPosition.x - this.offset,
            y: blastPosition.y
        }

        /** If we have contact than we must 'make damage' to terrain.
         * We take circle with radius blastRadius and center in
         * blastPosition and 'cut' it from terrain. This means that we
         * make invisible all terrain pixels that lie in and on the
         * circle, setting their alpha component to 0.
         * All math equal to collision detection.
         */
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
        
        this.redrawTerrain();
    }

    redrawTerrain(){
        createImageBitmap(this.imgData)
            .then(bitmap => this.imageBitmap = bitmap);
    }

    draw(context, scale, translation){        
    //    console.time("Drawing terrain...");
        context.save();
        context.drawImage(this.imageBitmap, translation * scale + this.offset, 0);
    //    context.putImageData(this.imgData, translation * scale + 150, 0);
        context.restore();        
    //    console.timeEnd("Drawing terrain...");       
    }
}