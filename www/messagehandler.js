class MessageHandler{
    constructor(
        gameManager,
        registerHandler, 
        gameEventsHandler, 
        searchHandler,
        messageHand
    ){
        this.gameManagerContext = gameManager;
        this.registerHandler = registerHandler;
        this.gameEventsHandler = gameEventsHandler;
        this.searchHandler = searchHandler;
        this.messageHand = messageHand;

        this.connector = new Connector(this);
        this.connectionId = this.connector.connectionId;
    }

    handleMessage(rawMessage){

        if(rawMessage instanceof CloseEvent){
            this.handleConnectionLost();
            return;
        }

        let parsedMessage = JSON.parse(rawMessage.data);
        switch (parsedMessage.type){
            case "register":
                this.registerHandler.call(
                    this.gameManagerContext,
                    parsedMessage
                );
                break;
            case "search":
                this.searchHandler.call(
                    this.gameManagerContext,
                    parsedMessage
                );
                break;                
            case "errmsg":
            //	for future features
                break;                
            case "gamemsg":
                this.gameEventsHandler.call(
                    this.gameManagerContext,
                    parsedMessage
                );
                break;  
            case "message":
                this.messageHand.call(
                    this.gameManagerContext,
                    parsedMessage
                );
                break;
        }
    }

    sendMessage(type, event=null, extraData={}){
        let data = {
            type: type,
            token: this.connectionId
        };
        switch (type){
            case "search":
                data.nick = extraData.nick;
                break;
            case "stopsearch":
                break;
            case "gamemsg":
                data.event = event;
                if(event == "aimchange")
                    data.angle = extraData.angle;
                else if(event == "shot"){
                    data.angle = extraData.angle;
                    data.strength = extraData.strength;
                }
                else if(event == "nextturn"){}
                else if(event == "hit")
                    data.player = extraData.player;
                else if(event=="turntimeover"){}
                else if(event=="surrender"){}
                break;
        }

        this.connector.send(
            this.prepareMessage(data)
        );
    }

    
    prepareMessage(message){
        return unescape(encodeURIComponent(
            JSON.stringify(message)
        ));
    }

    handleError(error, readyState){
        var div = document.createElement("div");
        div.innerHTML = "<font style=\"font-size: 10px;\">\
                        No connection to server</font>";
        div.style.width = "100%";
        div.style.textAlign = "center";
        errorMessageDiv.appendChild(div);
        gameinfo.status = 6;
        stopgame("connection");
    }
    handleConnectionLost(){
        var div = document.createElement("div");
        div.innerHTML = "<font style=\"font-size: 10px;\">\
                        No connection to server</font>";
        div.style.width = "100%";
        div.style.textAlign = "center";
        errorMessageDiv.appendChild(div);
        gameinfo.status = 6;
        this.gameManagerContext.stopGame("connection");
    }
}