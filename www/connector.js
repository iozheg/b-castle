/**
 * Manages WebSocket connection.
 * 
 * @class Connector
 */
class Connector{
    /**
     * Creates an instance of Connector.
     * Establishes WebSocket connection to server and sends first
     * message to server to register client.
     * @param {!function} messageHandler 
     * @memberof Connector
     */
    constructor(messageHandler){
        this.messageHandler = messageHandler;

        let currentDate = new Date();
        /** Unique client's ID. */
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
            console.log(e);
        }
    }

    /**
     * Sends JSON string to server.
     * 
     * @param {!string} message 
     * @memberof Connector
     */
    send(message){
        this.ws.send(message);
    }

    /**
     * Returns client's ID.
     * 
     * @readonly
     * @memberof Connector
     */
    get connectionId(){
        return this.rId;
    }

}