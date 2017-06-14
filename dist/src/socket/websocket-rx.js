import { Observable } from "rxjs/Observable";
var WebsocketRx = (function () {
    function WebsocketRx(url) {
        this.connect(url);
    }
    Object.defineProperty(WebsocketRx.prototype, "messages", {
        get: function () {
            return this.socketChannel;
        },
        enumerable: true,
        configurable: true
    });
    WebsocketRx.prototype.send = function (data) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        }
    };
    WebsocketRx.prototype.close = function () {
        this.socket.close();
    };
    WebsocketRx.prototype.connect = function (url) {
        if (!this.socketChannel) {
            this.socket = new WebSocket(url);
            this.socketChannel = this.create(this.socket);
        }
    };
    WebsocketRx.prototype.create = function (ws) {
        return Observable.create(function (obs) {
            ws.onmessage = obs.next.bind(obs);
            ws.onerror = obs.error.bind(obs);
            ws.onclose = obs.complete.bind(obs);
            return ws.close.bind(ws);
        });
    };
    return WebsocketRx;
}());
export { WebsocketRx };
//# sourceMappingURL=websocket-rx.js.map