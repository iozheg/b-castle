function loadResources() {
	var imgCannonball = new Image();
	var imgBlast = new Image();
	var imgCastle = new Image();
	var imgCannonLeft = new Image();
	var imgCannonRight = new Image();
	var imgStartButton = new Image();
	var imgWindLeft = new Image();
	var imgWindRight = new Image();
	var imgLoading = new Image();
	
	imgCannonball.src = "images/cannonball.png";
	imgBlast.src = "images/blast.png";
	imgCastle.src = "images/castle.png";
	imgCannonLeft.src = "images/cannonleft.png";
	imgCannonRight.src = "images/cannonright.png";
	imgStartButton.src = "images/start_button.png";
	imgWindLeft.src = "images/windleft.png";
	imgWindRight.src = "images/windright.png";
	imgLoading.src = "images/cannonballloading.png";
	
	resources["cannonball"] = imgCannonball;
	resources["blast"] = imgBlast;
	resources["castle"] = imgCastle;
	resources["cannonleft"] = imgCannonLeft;
	resources["cannonright"] = imgCannonRight;
	resources["start_button"] = imgStartButton;
	resources["windleft"] = imgWindLeft;
	resources["windright"] = imgWindRight;
	resources["loading"] = imgLoading;
}