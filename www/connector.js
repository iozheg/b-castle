class Connector{

    constructor(messageHandler){
        this.messageHandler = messageHandler;
    //    this.closeHandler = closeHandler;

        let currentDate = new Date();
        this.rId = hex_md5(
            Math.random() 
            + " " + currentDate.getDate() 
            + " " + currentDate.getTime()
        );
        gameinfo.rId = this.rId;
        gameinfo.status = 1;

        this.ws = new WebSocket(
            "ws://" + window.location.hostname + ":8888/ws?id=" + this.rId
        );
        this.ws.gameinfo = gameinfo;        
    //    this.ws.callbackOnMessage = this.getMessage;
    //    this.ws.callbackOnClose = this.closeConnection;

        this.ws.onopen = function(e) {
            this.gameinfo.status = 1;
        //    _gameinfo;
            this.send(
                unescape(encodeURIComponent(
                    '{"type" : "register", \
                    "token" : "' + this.gameinfo.rId + '"}'
                ))
            );
        }
        this.ws.onclose = e => messageHandler.handleMessage(e);
        this.ws.onmessage = e => messageHandler.handleMessage(e);
        this.ws.onerror = function(e) {	
        }
    }

    send(message){
        this.ws.send(message);
    }
/*
    getMessage(data){
        this.messageHandler.handleMessage(data);
    }

    closeConnection(data){
        this.messageHandler.handleConnectionLost();
    }*/

}