class Terrain{
    constructor(context, terrainLine){
        this.width = 1800;
        this.height = 700;
        //every pixel of imgData contains 4 elements: r, g, b, a
        this.rowCapacity = this.width * 4;
        this.imgData = context.createImageData(this.width, this.height);
        
        this.terrainLine = new Array(terrainLine.length);
        this.terrainLine = terrainLine;
        //we have to fill whole imgData massive using terrain line
        this.fillTerrain();
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

    draw(context, scale){
        context.save();
        context.putImageData(this.imgData, translation * scale + 150, 0);
        context.restore();
    }
}