/**
 * Manages loading animation.
 * 
 * @class LoadingAnimation
 */
class LoadingAnimation{
    /**
     * Creates an instance of LoadingAnimation.
     * @param {!Image} image 
     * @param {!Element} parentElement Parent DOM element where
     *      animation will be added.
     * @memberof LoadingAnimation
     */
    constructor(image, parentElement){
        this.parentElement = parentElement;
        this.loading = document.createElement("div");
        this.loading.id = "loading";
        this.loading.style.backgroundImage = "url('" + image.src + "')";
    }

    /**
     * Shows loading animation.
     * 
     * @memberof LoadingAnimation
     */
    show(){
        this.parentElement.appendChild(this.loading);
    }

    /**
     * Hides loading animation.
     * 
     * @memberof LoadingAnimation
     */
    hide(){
        try{
            this.parentElement.removeChild(this.loading);
        }
        catch (e){

        }
    }
}