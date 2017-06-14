/**
 * This codes based on https://github.com/aszechlicki/stomp-ts/tree/develop
 * TODO: Move this code into its own typescript library
 */
import { MessageSubscription, StompCommand, StompFrame, StompFrameError, StompFrameMessage } from "./stomp-frame";
import { BYTE, StompFrameDeserializer, StompFrameSerializer } from "./stomp-frame-parser";
import { Subject } from "rxjs/Subject";
export var Stomp = {
    VERSIONS: {
        V1_0: '1.0',
        V1_1: '1.1',
        V1_2: '1.2'
    },
    supportedVersions: '1.1,1.0',
    client: function (url, protocols) {
        if (protocols === void 0) { protocols = ['v10.stomp', 'v11.stomp']; }
        var ws = new WebSocket(url, protocols);
        return new StompClient(ws);
    }
};
var StompConfig = (function () {
    function StompConfig() {
        this.headers = new Map();
    }
    return StompConfig;
}());
export { StompConfig };
var StompClient = (function () {
    function StompClient(ws) {
        this.ws = ws;
        this.frameSerializer = new StompFrameSerializer();
        this.frameDeserializer = new StompFrameDeserializer();
        this.counter = 0;
        this.connected = false;
        this.heartbeat = {
            outgoing: 10000,
            incoming: 10000
        };
        this.connectSubject = new Subject();
        this.receiptSubject = new Subject();
        this.messageSubject = new Subject();
        this.errorSubject = new Subject();
        /**
         * maximum *WebSocket* frame size sent by the client. If the STOMP frame
         * is bigger than this value, the STOMP frame will be sent using multiple
         * WebSocket frames (default is 16KiB)
         * @type {number}
         */
        this.maxWebSocketFrameSize = 16 * 1024;
        this.subscriptions = new Map();
        this.ws.binaryType = 'arraybuffer';
        console.log("socket state:", ws.readyState);
    }
    Object.defineProperty(StompClient.prototype, "receipts", {
        get: function () {
            return this.receiptSubject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StompClient.prototype, "messages", {
        get: function () {
            return this.messageSubject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StompClient.prototype, "errors", {
        get: function () {
            return this.errorSubject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StompClient.prototype, "onConnect", {
        get: function () {
            return this.connectSubject;
        },
        enumerable: true,
        configurable: true
    });
    StompClient.prototype.connect = function (config) {
        var _this = this;
        if (!config)
            config = new StompConfig();
        if (!config.headers) {
            config.headers = new Map();
        }
        if (config.login) {
            config.headers.set('login', config.login);
        }
        if (config.passcode) {
            config.headers.set('passcode', config.passcode);
        }
        this.debug('Opening WebSocket...');
        this.ws.onmessage = function (evt) {
            var unmarshalledData = _this.frameDeserializer.deserializeMessage(evt.data);
            _this.serverActivity = Date.now();
            unmarshalledData.frames.forEach(function (f) { return _this.handleFrame(f); });
        };
        this.ws.onclose = function () {
            var message = "Lost connection to " + _this.ws.url;
            _this.debug(message);
            _this.cleanup();
            _this.onError(new StompFrameError(message));
        };
        this.ws.onopen = function () {
            _this.debug('WebSocket opened. Attempting to connect to STOMP now...');
            var headers = new Map();
            headers.set('accept-version', '1.2');
            headers.set('host', 'localhost');
            //headers.set('accept-version', Stomp.supportedVersions);
            //headers.set('heart-beat', [this.heartbeat.outgoing, this.heartbeat.incoming].join(','));
            _this.transmit(StompCommand.CONNECT, headers);
        };
    };
    /**
     * [DISCONNECT Frame](http://stomp.github.com/stomp-specification-1.1.html#DISCONNECT)
     * @param disconnectCallback
     * @param headers
     */
    StompClient.prototype.disconnect = function (disconnectCallback, headers) {
        this.transmit(StompCommand.DISCONNECT, headers);
        this.ws.onclose = null;
        this.ws.close();
        this.cleanup();
        disconnectCallback();
    };
    /**
     * [SEND Frame](http://stomp.github.com/stomp-specification-1.1.html#SEND)
     * @param destination
     * @param headers
     * @param body
     */
    StompClient.prototype.send = function (destination, body) {
        var headers = new Map();
        headers.set('destination', destination);
        this.transmit(StompCommand.SEND, headers, body);
    };
    /**
     * [SUBSCRIBE Frame](http://stomp.github.com/stomp-specification-1.1.html#SUBSCRIBE)
     * @param destination
     * @param callback
     * @param headers
     */
    StompClient.prototype.subscribe = function (destination, headers) {
        if (!headers) {
            headers = new Map();
        }
        var subId = headers.get('id') ? headers.get('id') : "sub-" + this.counter++;
        headers.set('id', subId);
        var sub = new MessageSubscription(subId, destination, this.messages);
        this.subscriptions.set(destination, sub);
        headers.set('destination', destination);
        headers.set('ack', 'auto');
        this.transmit(StompCommand.SUBSCRIBE, headers);
        return sub;
    };
    /**
     * [UNSUBSCRIBE Frame](http://stomp.github.com/stomp-specification-1.1.html#UNSUBSCRIBE)
     * @param sub
     */
    StompClient.prototype.unsubscribe = function (sub) {
        var headers = new Map();
        headers.set('id', sub.subscriptionId);
        this.subscriptions.delete(sub.subscriptionId);
        this.transmit(StompCommand.UNSUBSCRIBE, headers);
    };
    /**
     * [ABORT Frame](http://stomp.github.com/stomp-specification-1.1.html#ABORT)
     * @param transaction
     */
    StompClient.prototype.abort = function (transaction) {
        var headers = new Map();
        headers.set('transaction', transaction);
        this.transmit(StompCommand.ABORT, headers);
    };
    /**
     * [BEGIN Frame](http://stomp.github.com/stomp-specification-1.1.html#BEGIN)
     * @param transaction
     */
    StompClient.prototype.begin = function (transaction) {
        var _this = this;
        var txid = transaction || "tx-" + this.counter++;
        var headers = new Map();
        headers.set('transaction', txid);
        this.transmit(StompCommand.BEGIN, headers);
        return {
            id: txid,
            commit: function () {
                _this.commit(txid);
            },
            abort: function () {
                _this.abort(txid);
            }
        };
    };
    /**
     * [COMMIT Frame](http://stomp.github.com/stomp-specification-1.1.html#COMMIT)
     * @param transaction
     */
    StompClient.prototype.commit = function (transaction) {
        var headers = new Map();
        headers.set('transaction', transaction);
        this.transmit(StompCommand.COMMIT, headers);
    };
    /**
     * [ACK Frame](http://stomp.github.com/stomp-specification-1.1.html#ACK)
     * @param id
     * @param transaction
     */
    StompClient.prototype.ack = function (id, transaction) {
        var headers = new Map();
        headers.set('id', id);
        if (transaction) {
            headers.set('transaction', transaction);
        }
        this.transmit(StompCommand.ACK, headers);
    };
    /**
     * [NACK Frame](http://stomp.github.com/stomp-specification-1.1.html#NACK)
     * @param id
     * @param transaction
     */
    StompClient.prototype.nack = function (id, transaction) {
        var headers = new Map();
        headers.set('id', id);
        if (transaction) {
            headers.set('transaction', transaction);
        }
        this.transmit(StompCommand.NACK, headers);
    };
    StompClient.prototype.cleanup = function () {
        this.connected = false;
        clearInterval(this.pinger);
        clearInterval(this.ponger);
    };
    StompClient.prototype.handleFrame = function (frame) {
        switch (frame.command) {
            // [CONNECTED Frame](http://stomp.github.com/stomp-specification-1.1.html#CONNECTED_Frame)
            case StompCommand.CONNECTED:
                this.debug("connected to server ", frame.getHeader('server'));
                this.connected = true;
                this.setupHeartbeat(frame);
                this.connectSubject.next(frame);
                break;
            // [MESSAGE Frame](http://stomp.github.com/stomp-specification-1.1.html#MESSAGE)
            case StompCommand.MESSAGE:
                this.messageSubject.next(new StompFrameMessage(frame));
                break;
            //[RECEIPT Frame](http://stomp.github.com/stomp-specification-1.1.html#RECEIPT)
            case StompCommand.RECEIPT:
                this.receiptSubject.next(frame);
                break;
            case StompCommand.ERROR:
                this.onError(new StompFrameError(null, frame));
                this.debug('error received: ', frame);
                break;
            default:
                throw new Error("not supported STOMP command '" + frame.command + "'");
        }
    };
    StompClient.prototype.onError = function (error) {
        this.errorSubject.next(error);
    };
    StompClient.prototype.transmit = function (command, headers, body) {
        var frame = StompFrame.build(command, headers, body);
        var out = this.frameSerializer.serialize(frame);
        this.debug(">>> ", out);
        while (out.length > this.maxWebSocketFrameSize) {
            this.ws.send(out.substring(0, this.maxWebSocketFrameSize));
            out = out.substring(this.maxWebSocketFrameSize);
            this.debug("remaining = ", out.length);
        }
        this.ws.send(out);
    };
    StompClient.prototype.setupHeartbeat = function (frame) {
        var _this = this;
        if (!frame.getHeader('version') || frame.getHeader('version') === Stomp.VERSIONS.V1_0) {
            return;
        }
        // heart-beat header received from the server looks like:
        // heart-beat: sx, sy
        var heartBeat = frame.getHeader('heart-beat').split(',').map(parseInt);
        var serverIncoming = heartBeat[0];
        var serverOutgoing = heartBeat[1];
        if (this.heartbeat.outgoing > 0 && serverOutgoing > 0) {
            var ttl = Math.max(this.heartbeat.outgoing, serverOutgoing);
            this.debug("Check PING every " + ttl + "ms");
            this.pinger = setInterval(function () {
                _this.sendHeartBeat();
            }, ttl);
        }
        if (this.heartbeat.incoming > 0 && serverIncoming > 0) {
            var ttl_1 = Math.max(this.heartbeat.incoming, serverIncoming);
            this.debug("check PONG every " + ttl_1 + "ms");
            this.ponger = setInterval(function () {
                var delta = Date.now() - _this.serverActivity;
                if (delta > ttl_1 * 2) {
                    _this.debug("Did not receive server activity for the last " + delta + "ms");
                    _this.ws.close();
                }
            }, ttl_1);
        }
    };
    StompClient.prototype.sendHeartBeat = function () {
        this.ws.send(BYTE.LF);
        this.debug('>>> PING');
    };
    StompClient.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log(message, args);
    };
    return StompClient;
}());
export { StompClient };
//# sourceMappingURL=stomp-client.js.map