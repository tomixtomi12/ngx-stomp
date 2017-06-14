import { Observable } from "rxjs/Rx";
export interface FrameBuffer {
    frames: StompFrame[];
    partial: string;
}
export declare class MessageSubscription {
    private _id;
    private _destination;
    private _messages;
    constructor(_id: string, _destination: string, _messages: Observable<StompFrameMessage>);
    /**
     * Gets the internal subscription id
     * @returns {string}
     */
    readonly subscriptionId: string;
    /**
     * Gets the subsription destionation
     * @returns {string}
     */
    readonly destination: string;
    /**
     * Gets an observable stream of all messages of this subscription.
     */
    readonly messages: Observable<StompFrameMessage>;
}
export declare enum StompCommand {
    ACK = 0,
    NACK = 1,
    ABORT = 2,
    BEGIN = 3,
    COMMIT = 4,
    CONNECT = 5,
    CONNECTED = 6,
    DISCONNECT = 7,
    MESSAGE = 8,
    RECEIPT = 9,
    SUBSCRIBE = 10,
    UNSUBSCRIBE = 11,
    SEND = 12,
    ERROR = 13,
}
export declare class StompFrame {
    private _command;
    private _body;
    private _headers;
    constructor(command: StompCommand, body: string, headers?: Map<string, string>);
    readonly command: StompCommand;
    readonly body: string;
    readonly bodyJson: any;
    /**
     * Gets the header value with the given key if available.
     * Otherwise, returns null.
     *
     * @param key
     * @returns {undefined|string}
     */
    getHeader(key: string): string | null;
    /**
     *  Gets the header value with the given key if available.
     *  Otherwise, throws an exception.
     *
     * @param key
     * @returns {string}
     */
    getRequiredHeader(key: string): string;
    setHeader(key: string, value: string): void;
    foreachHeader(callbackfn: (value: string, key: string) => void): void;
    static build(command: StompCommand, headers: Map<string, string>, body: string): StompFrame;
    readonly headers: Map<string, string>;
}
export declare class StompFrameMessage extends StompFrame {
    constructor(frame: StompFrame);
    readonly messageId: string;
    readonly destination: string;
    readonly subscriptionId: string;
}
export declare class StompFrameError extends StompFrame {
    constructor(message: string, frame?: StompFrame);
    readonly errorMessage: string;
    readonly errorDetail: string;
}
