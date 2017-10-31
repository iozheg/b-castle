var Terrain = function(context) {
	this.width = 1800;
	this.height = 700;
	this.rowCapacity = this.width * 4; //every pixel of imgData contains 4 elements: r, g, b, a
	this.imgData = context.createImageData(this.width, this.height);
	
	this.k = 0.8; 	//some factor to manipulate terrain view. you may test it

	if(gameinfo.terrain == 0){	//if server not sended terrain line, then we should create it on client PC (may be it's usefull for standalone)
		this.terrainLine = new Array(this.width);
		this.prepare();
	}
	else{		//else we use server terrain line
		this.terrainLine = new Array(gameinfo.terrain.length);
		this.terrainLine = gameinfo.terrain;
	}
	this.fillterrain();	//we have to fill whole imgData massive using terrain line


}

Terrain.prototype.fillterrain = function(){
	peakColor = 230; 	// defines color of terrain's peaks
	bottomColor = 165; 	// color for the terrain bottom

	// fill terrain
	for (i = 0; i < this.terrainLine.length; i++) {
		index = (this.height - this.terrainLine[i]) * this.rowCapacity + i*4; 	// (this.height - this.terrainLine[i]) 						- height of current pixel (or row of the current pixel)
																				// (this.height - this.terrainLine[i]) * this.rowCapacity 	- this.imgData.data is linear so this is offset because of pixel's height (vertical position)
																				// i*4				- offset because of horizontal position of pixel
		if(i%5==0)
			heightCoef = this.terrainLine[i] / this.height; // defines factor of how pixel of terrain changes it's color in addiction to it's height
				
		color = { 	// define color for terrain pixels
			r: peakColor * heightCoef,
			g: heightCoef * (peakColor-bottomColor) + bottomColor,
			b: peakColor * heightCoef
		}
		
		this.imgData.data[index +0] = color.r;
		this.imgData.data[index +1] = color.g;
		this.imgData.data[index +2] = color.b;
		this.imgData.data[index +3] = 255;
		
		for(j = 1; j < this.terrainLine[i]; j++){ 	// fill all pixel under surface
			index = index + this.rowCapacity;		// iterating all pixels under current
			if(j < 5){
				this.imgData.data[index +0] = color.r;
				this.imgData.data[index +1] = color.g;
				this.imgData.data[index +2] = color.b;
				this.imgData.data[index +3] = 255;
			}
			else{
				internalHeightCoef = (this.terrainLine[i]-j + Math.random()*10)/ this.height;
				this.imgData.data[index +0] = peakColor * internalHeightCoef;
				this.imgData.data[index +1] = internalHeightCoef * (peakColor-bottomColor) + bottomColor;
				this.imgData.data[index +2] = peakColor * internalHeightCoef;
				this.imgData.data[index +3] = 255;
			}
		}
	}
}

Terrain.prototype.draw = function(context, scale){
    context.save();
 	context.putImageData(this.imgData, translation * scale + 150, 0);
	context.restore();
}

function mdp(res, indexH1, indexH2, k, height){ 
	//midpoint displacement. generate terrain line
	len = indexH2 - indexH1;
	if(len <= 1)
		return;
	index = Math.round((indexH1 + indexH2)/2);
	res[index] = Math.abs(Math.round((res[indexH1] + res[indexH2]) / 2 + rand(-1 * k * len, k*len)));

	mdp(res, indexH1, index, k, height);
	mdp(res, index, indexH2, k, height);
}

function rand(min, max){
	return Math.random() * (max - min) + min;
}

Terrain.prototype.prepare = function (){
	this.terrainLine[0] = this.terrainLine[this.terrainLine.length-1] = 1;
	mdp(this.terrainLine, 0, this.terrainLine.length-1, this.k, this.height);
	
	//normalize values. they must be from 0 to this.height
	var max = 0;
	for(i = 0; i < this.terrainLine.length; i++){
		if(max < this.terrainLine[i])  max = this.terrainLine[i];
	}
	if(max > this.height){
		var k = this.height / max;
		for(i = 0; i < this.terrainLine.length; i++){
			this.terrainLine[i] = this.terrainLine[i] * k;
		}
	}
	
	//smoothing
	 for(i = 0; i+2 < this.terrainLine.length; i++){ 
		this.terrainLine[i+1] = ((this.terrainLine[i] + this.terrainLine[i+2]) /2)>>0;
	}
}
