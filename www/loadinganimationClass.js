var LoadingAnimation = function(image){
	this.loading = document.createElement("div");
	this.loading.id = "loading";
	this.loading.style.backgroundImage = "url('" + image.src + "')";
}

LoadingAnimation.prototype.show = function(parentElement){
	parentElement.appendChild(this.loading);
}
LoadingAnimation.prototype.hide = function(parentElement){
	try{
		parentElement.removeChild(this.loading);
	}
	catch(e){console.log("No loading animation.");}
}