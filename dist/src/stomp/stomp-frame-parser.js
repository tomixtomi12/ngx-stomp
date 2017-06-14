// Define constants for bytes used throughout the code
import { StompCommand, StompFrame } from "./stomp-frame";
export var BYTE = {
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
export { StompFrameDeserializer };
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
export { StompFrameSerializer };
//# sourceMappingURL=stomp-frame-parser.js.map