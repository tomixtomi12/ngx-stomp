(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs/Subject'), require('rxjs/Observable')) :
	typeof define === 'function' && define.amd ? define(['exports', 'rxjs/Subject', 'rxjs/Observable'], factory) :
	(factory((global.ng = global.ng || {}, global.ng.ngxStomp = global.ng.ngxStomp || {}),global.rxjs_Subject,global.rxjs_Observable));
}(this, (function (exports,rxjs_Subject,rxjs_Observable) { 'use strict';

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MessageSubscription = (function () {
    function MessageSubscription(_id, _destination, _messages) {
        this._id = _id;
        this._destination = _destination;
        this._messages = _messages;
    }
    Object.defineProperty(MessageSubscription.prototype, "subscriptionId", {
        /**
         * Gets the internal subscription id
         * @returns {string}
         */
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MessageSubscription.prototype, "destination", {
        /**
         * Gets the subsription destionation
         * @returns {string}
         */
        get: function () { return this._destination; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MessageSubscription.prototype, "messages", {
        /**
         * Gets an observable stream of all messages of this subscription.
         */
        get: function () {
            var _this = this;
            return this._messages
                .filter(function (m) { return m.subscriptionId == _this.subscriptionId; });
        },
        enumerable: true,
        configurable: true
    });
    return MessageSubscription;
}());
var StompCommand;
(function (StompCommand) {
    StompCommand[StompCommand["ACK"] = 0] = "ACK";
    StompCommand[StompCommand["NACK"] = 1] = "NACK";
    StompCommand[StompCommand["ABORT"] = 2] = "ABORT";
    StompCommand[StompCommand["BEGIN"] = 3] = "BEGIN";
    StompCommand[StompCommand["COMMIT"] = 4] = "COMMIT";
    StompCommand[StompCommand["CONNECT"] = 5] = "CONNECT";
    StompCommand[StompCommand["CONNECTED"] = 6] = "CONNECTED";
    StompCommand[StompCommand["DISCONNECT"] = 7] = "DISCONNECT";
    StompCommand[StompCommand["MESSAGE"] = 8] = "MESSAGE";
    StompCommand[StompCommand["RECEIPT"] = 9] = "RECEIPT";
    StompCommand[StompCommand["SUBSCRIBE"] = 10] = "SUBSCRIBE";
    StompCommand[StompCommand["UNSUBSCRIBE"] = 11] = "UNSUBSCRIBE";
    StompCommand[StompCommand["SEND"] = 12] = "SEND";
    StompCommand[StompCommand["ERROR"] = 13] = "ERROR";
})(StompCommand || (StompCommand = {}));
var StompFrame = (function () {
    function StompFrame(command, body, headers) {
        this._body = null;
        if (!command)
            throw new Error("ArgumentNullException: 'command'");
        this._command = command;
        this._body = body;
        if (headers) {
            this._headers = new Map(headers);
        }
        else {
            this._headers = new Map();
        }
    }
    Object.defineProperty(StompFrame.prototype, "command", {
        get: function () {
            return this._command;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StompFrame.prototype, "body", {
        get: function () {
            return this._body;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StompFrame.prototype, "bodyJson", {
        get: function () {
            if (this._body) {
                return JSON.parse(this._body);
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the header value with the given key if available.
     * Otherwise, returns null.
     *
     * @param key
     * @returns {undefined|string}
     */
    StompFrame.prototype.getHeader = function (key) {
        return this._headers.get(key);
    };
    /**
     *  Gets the header value with the given key if available.
     *  Otherwise, throws an exception.
     *
     * @param key
     * @returns {string}
     */
    StompFrame.prototype.getRequiredHeader = function (key) {
        var header = this.getHeader(key);
        if (header) {
            return header;
        }
        throw new Error("The required header " + key + " was not present in the frame!");
    };
    StompFrame.prototype.setHeader = function (key, value) {
        this._headers.set(key, value);
    };
    StompFrame.prototype.foreachHeader = function (callbackfn) {
        this._headers.forEach(callbackfn);
    };
    StompFrame.build = function (command, headers, body) {
        return new StompFrame(command, body, headers);
    };
    Object.defineProperty(StompFrame.prototype, "headers", {
        get: function () { return this._headers; },
        enumerable: true,
        configurable: true
    });
    return StompFrame;
}());
var StompFrameMessage = (function (_super) {
    __extends(StompFrameMessage, _super);
    function StompFrameMessage(frame) {
        return _super.call(this, frame.command, frame.body, frame.headers) || this;
    }
    Object.defineProperty(StompFrameMessage.prototype, "messageId", {
        get: function () {
            return this.getRequiredHeader('message-id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StompFrameMessage.prototype, "destination", {
        get: function () {
            return this.getRequiredHeader('destination');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StompFrameMessage.prototype, "subscriptionId", {
        get: function () {
            return this.getRequiredHeader('subscription');
        },
        enumerable: true,
        configurable: true
    });
    return StompFrameMessage;
}(StompFrame));
var StompFrameError = (function (_super) {
    __extends(StompFrameError, _super);
    function StompFrameError(message, frame) {
        var _this = _super.call(this, StompCommand.ERROR, frame != null ? frame.body : null, frame != null ? frame.headers : null) || this;
        if (message) {
            _this.setHeader('message', message);
        }
        return _this;
    }
    Object.defineProperty(StompFrameError.prototype, "errorMessage", {
        get: function () {
            return this.getHeader('message');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StompFrameError.prototype, "errorDetail", {
        get: function () {
            return this.body;
        },
        enumerable: true,
        configurable: true
    });
    return StompFrameError;
}(StompFrame));

// Define constants for bytes used throughout the code
var BYTE = {
    // LINEFEED byte (octet 10)
    LF: '\x0A',
    // NULL byte (octet 0)
    NULL: '\x00'
};
/**
 * Provides the ability to parse a message into frame(s)
 */
var StompFrameDeserializer = (function () {
    function StompFrameDeserializer() {
    }
    StompFrameDeserializer.prototype.deserializeMessage = function (message) {
        var data;
        if (typeof ArrayBuffer && message instanceof ArrayBuffer) {
            var arr = new Uint8Array(message);
            console.log('--- got data length: ', arr.length);
            var stringArray_1 = [];
            arr.forEach(function (val) { return stringArray_1.push(String.fromCharCode(val)); });
            data = stringArray_1.join('');
        }
        else {
            // take data directly from WebSocket 'data' field
            data = message;
        }
        // If heart-beats are requested and no real frame is sent, EOL is expected
        if (data === BYTE.LF) {
            console.log('<<< heart-beat received');
            return;
        }
        return this.deserializeFrames(data);
    };
    StompFrameDeserializer.prototype.deserializeFrames = function (data) {
        var frames = data.split("" + BYTE.NULL + BYTE.LF + "*");
        var buffer = {
            frames: [],
            partial: ''
        };
        for (var i = 0; i < frames.length - 1; i++) {
            buffer.frames.push(this.deserializeFrame(frames[i]));
        }
        var lastFrame = frames[frames.length - 1];
        if (lastFrame === BYTE.LF || lastFrame.search("" + BYTE.NULL + BYTE.LF + "*$") !== -1) {
            buffer.frames.push(this.deserializeFrame(frames[frames.length - 1]));
        }
        else {
            buffer.partial = lastFrame;
        }
        return buffer;
    };
    StompFrameDeserializer.prototype.deserializeFrame = function (data) {
        try {
            // search for 2 consecutive LF bytes to split command and headers from the body
            //let divider = data.search(`///${BYTE.LF}${BYTE.LF}///`);
            var divider = data.search('\n\r?\n\r?');
            var headerLines = data.substring(0, divider).split(BYTE.LF);
            //console.log('console', divider);
            //console.log("data chars", data.split(''));
            var commandStr = headerLines.shift();
            var headers = new Map();
            var body = '';
            for (var _i = 0, _a = headerLines.reverse(); _i < _a.length; _i++) {
                var line = _a[_i];
                var idx = line.indexOf(':');
                headers.set(this.trim(line.substring(0, idx)), this.trim(line.substring(idx + 1)));
            }
            // skip the 2 LF bytes that divides the headers from the body
            var start = divider + 2;
            if (headers.get('content-length')) {
                var len = parseInt(headers.get('content-length'));
                body = ('' + data).substring(start, start + len);
            }
            else {
                var chr = null;
                for (var i = 0; i < data.length; i++) {
                    chr = data.charAt(i);
                    if (chr === BYTE.NULL) {
                        break;
                    }
                    body += chr;
                }
            }
            return new StompFrame(this.parseCommand(commandStr), body, headers);
        }
        catch (err) {
            // Failed to deserialize frame
            console.warn("Failed to parse frame:", data);
            throw err;
        }
    };
    StompFrameDeserializer.prototype.parseCommand = function (commandStr) {
        if (!commandStr)
            throw new Error("ArgumentNullException: commandStr was 'null' which is not a valid command string!");
        var command = StompCommand[commandStr];
        if (!command) {
            throw new Error("Could not parse command '" + commandStr + "' into a STOMP command!");
        }
        return command;
    };
    StompFrameDeserializer.prototype.trim = function (value) {
        return value.replace(/^\s+|\s+$/g, '');
    };
    return StompFrameDeserializer;
}());
/**
 * Provides the ability to serialize a stomp frame
 */
var StompFrameSerializer = (function () {
    function StompFrameSerializer() {
    }
    /**
     * Computes a textual representation of the frame.
     * Suitable to be sent to the server
     *
     * @returns {string} A textual representation of the frame
     */
    StompFrameSerializer.prototype.serialize = function (frame) {
        var commandStr = StompCommand[frame.command];
        var lines = [commandStr];
        var skipContentLength = false;
        /*
        skipContentLength = <boolean>frame.getHeader('content-length');
        if (skipContentLength) {
          delete frame.headers['content-length'];
        }*/
        if (frame.body && !skipContentLength) {
            frame.setHeader('content-length', StompFrameSerializer.getUTF8Length(frame.body) + '');
        }
        frame.foreachHeader(function (value, key) { return lines.push(key + ":" + value); });
        var header = lines.join(BYTE.LF);
        var content = header + BYTE.LF + BYTE.LF;
        if (frame.body) {
            content += frame.body;
        }
        content += BYTE.NULL;
        return content;
    };
    /**
     * Compute the size of a UTF-8 string by counting its number of bytes
     * (and not the number of characters composing the string)
     *
     * @param {string} value
     * @returns {number} number of bytes in the string
     */
    StompFrameSerializer.getUTF8Length = function (value) {
        if (value) {
            return encodeURI(value).match(/%..|./g).length;
        }
        return 0;
    };
    return StompFrameSerializer;
}());

/**
 * This codes based on https://github.com/aszechlicki/stomp-ts/tree/develop
 * TODO: Move this code into its own typescript library
 */
var Stomp = {
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
        this.connectSubject = new rxjs_Subject.Subject();
        this.receiptSubject = new rxjs_Subject.Subject();
        this.messageSubject = new rxjs_Subject.Subject();
        this.errorSubject = new rxjs_Subject.Subject();
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
        return rxjs_Observable.Observable.create(function (obs) {
            ws.onmessage = obs.next.bind(obs);
            ws.onerror = obs.error.bind(obs);
            ws.onclose = obs.complete.bind(obs);
            return ws.close.bind(ws);
        });
    };
    return WebsocketRx;
}());

/**
 * @module
 * @description
 * Entry point for all public APIs of the ngx stomp package.
 */

exports.Stomp = Stomp;
exports.WebsocketRx = WebsocketRx;

Object.defineProperty(exports, '__esModule', { value: true });

})));
