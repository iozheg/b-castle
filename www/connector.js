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

        this.ws = new WebSocket(
            "ws://" + window.location.hostname + ":8888/ws?id=" + this.rId
        );
        this.ws.rId = this.rId;        

        this.ws.onopen = function(e) {
        //    _gameinfo;
            this.send(
                unescape(encodeURIComponent(
                    '{"type" : "register", \
                    "token" : "' + this.rId + '"}'
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

    get connectionId(){
        return this.rId;
    }
/*
    getMessage(data){
        this.messageHandler.handleMessage(data);
    }

    closeConnection(data){
        this.messageHandler.handleConnectionLost();
    }*/

}