var Connector = function(_gameinfo, errorMessageDiv){
	/*
		Connector establishs websocket connection and sends messages 
		to the server.
		Messagehandler recieves messages from server and handles them.
		
		errorMessageDiv - where error messages are displayed.
	*/
	
	var currentdate = new Date();
	rId = _gameinfo.rId = hex_md5(Math.random() + " " + currentdate.getDate() + " " + currentdate.getTime());
	_gameinfo.status = 1;	// 1 - connecting
				// 2 - registered
				// 3 - search opponent
				// 4 - playing
				// 5 - finished
				// 6 - connection lost
		
	this.messageHandler = new MessageHandler(_gameinfo, errorMessageDiv);
	
	this.ws = new WebSocket("ws://" + window.location.hostname + ":8888/ws?id=" + rId);
	this.ws.gameinfo = _gameinfo;
	this.ws.errorMessageDiv = errorMessageDiv;
	this.ws.callbackOnClose = this.messageHandler.handleConnectionLost;
//	this.ws.callbackOnError = this.messageHandler.handleError;
	this.ws.callbackOnMessage = this.messageHandler.handleMessage;
		
	this.ws.onopen = function(e) { 
		this.gameinfo.status = 1;
		this.send(unescape(encodeURIComponent('{"type" : "register", "token" : "' + rId + '"}')));
	}
	this.ws.onclose = function(e) { 
		this.callbackOnClose();
	}
	this.ws.onmessage = function(e) { 
		this.callbackOnMessage(e);
	}
	this.ws.onerror = function(e) {
	//	this.callbackOnError(e, this.readyState);		
	}
}

Connector.prototype.send = function(type, event, data){
	switch (type){
		case "search":
			this.ws.send(unescape(encodeURIComponent('{"token" : "' + rId + '", "type" : "search", "nick" : "' + this.ws.gameinfo.plnick + '"}')));
			break;
		case "stopsearch":
			this.ws.send(unescape(encodeURIComponent('{"token" : "' + rId + '", "type" : "stopsearch"}')));
			break;
		case "gamemsg":
			if(event == "aimchange")
				this.ws.send(unescape(encodeURIComponent('{"token" : "' + rId + '", "type" : "gamemsg", "event":"aimchange", "angle":' + data["angle"] + '}')));
			else if(event == "shot")
				this.ws.send(unescape(encodeURIComponent('{"token" : "' + rId + '", "type":"gamemsg", "event":"shot", "strength":' + data["strength"] + ', "angle":' + data["angle"] + '}')));
			else if(event == "nextturn")
				this.ws.send(unescape(encodeURIComponent('{"token" : "' + rId + '", "type":"gamemsg", "event":"nextturn"}')));
			else if(event == "hit")
				this.ws.send(unescape(encodeURIComponent('{"token" : "' + rId + '", "type":"gamemsg", "event":"hit", "target":"' + data["player"] + '"}')));
			else if(event=="turntimeover")
				this.ws.send(unescape(encodeURIComponent('{"token" : "' + rId + '", "type":"gamemsg", "event":"turntimeover"}')));
			else if(event=="surrender")
				this.ws.send(unescape(encodeURIComponent('{"token" : "' + rId + '", "type":"gamemsg", "event":"surrender"}')));
			break;
	}
}