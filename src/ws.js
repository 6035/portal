class WebSocketManager {
	constructor(serverDomain, onOpen, onMessage) {
		this.endpoint = `wss://${serverDomain}/ws`;
		this.ws = null;
		this.onOpen = onOpen;
		this.onMessage = onMessage;
		this.pingTimer = setInterval(this.ping.bind(this), 5000);
	}
	init() {
		this.ws = new WebSocket(this.endpoint);
		this.ws.onopen = (e) => {
			this.onOpen();
		};
		this.ws.onmessage = (e) => {
			const data = JSON.parse(e.data);
			this.onMessage(data);
		};
		this.ws.onclose = (e) => {
			console.log('websocket closed');
			this.init();
		};
	}
	send(data) {
		this.ws.send(JSON.stringify(data));
	}
	ping() {
		if (this.ws != null && this.ws.readyState == WebSocket.OPEN) {
			this.send({
				'type': 'ping',
			});
		}
	}
};

export { WebSocketManager };
