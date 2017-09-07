// Define constants for bytes used throughout the code
import {FrameBuffer, StompCommand, StompFrame} from './stomp-frame';


export const BYTE = {
    // LINEFEED byte (octet 10)
    LF: '\x0A',
    // NULL byte (octet 0)
    NULL: '\x00'
};

/**
 * Provides the ability to parse a message into frame(s)
 */
export class StompFrameDeserializer {


    public deserializeMessage(message: any) {
        let data: string;
        if (typeof ArrayBuffer && message instanceof ArrayBuffer) {
            let arr = new Uint8Array(message);
            console.log('--- got data length: ', arr.length);
            let stringArray: string[] = [];
            arr.forEach(val => stringArray.push(String.fromCharCode(val)));
            data = stringArray.join('');
        } else {
            // take data directly from WebSocket 'data' field
            data = message;
        }

        // If heart-beats are requested and no real frame is sent, EOL is expected
        if (data === BYTE.LF) {
            console.log('<<< heart-beat received');
            return;
        }

        return this.deserializeFrames(data);
    }


    private deserializeFrames(data: string): FrameBuffer {
        let frames = data.split(`${BYTE.NULL}${BYTE.LF}*`);

        let buffer: FrameBuffer = {
            frames: [],
            partial: ''
        };

        for (let i = 0; i < frames.length - 1; i++) {
            buffer.frames.push(this.deserializeFrame(frames[i]));
        }

        let lastFrame = frames[frames.length - 1];
        if (lastFrame === BYTE.LF || lastFrame.search(`${BYTE.NULL}${BYTE.LF}*$`) !== -1) {
            buffer.frames.push(this.deserializeFrame(frames[frames.length - 1]));
        } else {
            buffer.partial = lastFrame;
        }
        return buffer;
    }

    private deserializeFrame(data: string): StompFrame {

        try {
            // search for 2 consecutive LF bytes to split command and headers from the body
            // let divider = data.search(`///${BYTE.LF}${BYTE.LF}///`);
            let divider = data.search('\n\r?\n\r?');
            let headerLines = data.substring(0, divider).split(BYTE.LF);

            // console.log('console', divider);
            // console.log("data chars", data.split(''));

            let commandStr: string = headerLines.shift();
            let headers = new Map<string, string>();
            let body = '';

            for (let line of headerLines.reverse()) {
                let idx = line.indexOf(':');
                headers.set(this.trim(line.substring(0, idx)), this.trim(line.substring(idx + 1)));
            }

            // skip the 2 LF bytes that divides the headers from the body
            let start = divider + 2;
            if (headers.get('content-length')) {
                let len = parseInt(headers.get('content-length'));
                body = ('' + data).substring(start, start + len);
            } else {
                let chr: string = null;
                for (let i = 0; i < data.length; i++) {
                    chr = data.charAt(i);
                    if (chr === BYTE.NULL) {
                        break;
                    }
                    body += chr;
                }
            }
            return new StompFrame(this.parseCommand(commandStr), body, headers);
        }catch (err) {
            // Failed to deserialize frame
            console.warn('Failed to parse frame:', data);
            throw err;
        }
    }

    private parseCommand(commandStr: string): StompCommand {
        if (!commandStr) { throw new Error('ArgumentNullException: commandStr was \'null\' which is not a valid command string!'); }
        let command = StompCommand[commandStr as keyof typeof StompCommand];
        if (!command) {
            throw new Error(`Could not parse command '${commandStr}' into a STOMP command!`);
        }
        return command;
    }

    private trim(value: string): string {
        return value.replace(/^\s+|\s+$/g, '');
    }
}


/**
 * Provides the ability to serialize a stomp frame
 */
export class StompFrameSerializer {

    /**
     * Compute the size of a UTF-8 string by counting its number of bytes
     * (and not the number of characters composing the string)
     *
     * @param {string} value
     * @returns {number} number of bytes in the string
     */
    private static getUTF8Length(value: string): number {
        if (value) {
            return encodeURI(value).match(/%..|./g).length;
        }
        return 0;
    }

    /**
     * Computes a textual representation of the frame.
     * Suitable to be sent to the server
     *
     * @returns {string} A textual representation of the frame
     */
    public serialize(frame: StompFrame): string {
        let commandStr = StompCommand[frame.command];
        let lines: string[] = [commandStr];

        let skipContentLength = false;

        /*
        skipContentLength = <boolean>frame.getHeader('content-length');
        if (skipContentLength) {
          delete frame.headers['content-length'];
        }*/

        if (frame.body && !skipContentLength) {
            frame.setHeader('content-length', StompFrameSerializer.getUTF8Length(frame.body) + '');
        }
        frame.foreachHeader((value, key) => lines.push(`${key}:${value}`));

        let header = lines.join(BYTE.LF);

        let content = header + BYTE.LF + BYTE.LF;

        if (frame.body) {
            content += frame.body;
        }
        content += BYTE.NULL;

        return content;
    }

}
