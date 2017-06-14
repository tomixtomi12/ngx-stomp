import { FrameBuffer, StompFrame } from "./stomp-frame";
export declare const BYTE: {
    LF: string;
    NULL: string;
};
/**
 * Provides the ability to parse a message into frame(s)
 */
export declare class StompFrameDeserializer {
    deserializeMessage(message: any): FrameBuffer;
    private deserializeFrames(data);
    private deserializeFrame(data);
    private parseCommand(commandStr);
    private trim(value);
}
/**
 * Provides the ability to serialize a stomp frame
 */
export declare class StompFrameSerializer {
    /**
     * Computes a textual representation of the frame.
     * Suitable to be sent to the server
     *
     * @returns {string} A textual representation of the frame
     */
    serialize(frame: StompFrame): string;
    /**
     * Compute the size of a UTF-8 string by counting its number of bytes
     * (and not the number of characters composing the string)
     *
     * @param {string} value
     * @returns {number} number of bytes in the string
     */
    private static getUTF8Length(value);
}
