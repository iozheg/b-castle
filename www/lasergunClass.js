var Lasergun = function(start_pos, end_pos){
	//solve system of equations y = a * x + b;
	var a, b;
	var diff = 150;
	//first^ start_pos
	
	var startPos = {
		x: Math.round(start_pos.x * game.physics.scale) - diff,
		y: Math.round(start_pos.y * game.physics.scale)
	}
	var endPos = {
		x: Math.round(end_pos.x * game.physics.scale) - diff,
		y: Math.round(end_pos.y * game.physics.scale)
	}
	
	a = (endPos.y - startPos.y)/(endPos.x - startPos.x);
	b = startPos.y - a * startPos.x;
	
	
//	var coef = (startPos.y / startPos.x)>>0;
	for(x = 0; x < game.terrain.width/*game.physics.elementWidth - cameraLimits.right*game.physics.scale*/; x++){
		y = (x * a + b)>>0;
		for(i = -3; i <= 3; i++){
			index = (y+i) * game.terrain.rowCapacity + x * 4;
			game.terrain.imgData.data[index] = 255;
		}
	}
	setTimeout(function(){game.changePlayer()}, 500);
}