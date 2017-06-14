var __extends = (this && this.__extends) || (function () {
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
export { MessageSubscription };
export var StompCommand;
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
export { StompFrame };
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
export { StompFrameMessage };
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
export { StompFrameError };
//# sourceMappingURL=stomp-frame.js.map