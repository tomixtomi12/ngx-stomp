/**
 * This codes based on https://github.com/aszechlicki/stomp-ts/tree/develop
 * TODO: Move this code into its own typescript library
 */
import { MessageSubscription, StompFrame, StompFrameError, StompFrameMessage } from "./stomp-frame";
import { Observable } from "rxjs/Observable";
export declare const Stomp: {
    VERSIONS: {
        V1_0: string;
        V1_1: string;
        V1_2: string;
    };
    supportedVersions: string;
    client: (url: string, protocols?: string[]) => StompClient;
};
export declare class StompConfig {
    headers: Map<string, string>;
    login?: string;
    passcode?: string;
}
export declare class StompClient {
    private ws;
    private frameSerializer;
    private frameDeserializer;
    private counter;
    private connected;
    private heartbeat;
    private serverActivity;
    private pinger;
    private ponger;
    private partialData;
    private connectSubject;
    private receiptSubject;
    private messageSubject;
    private errorSubject;
    /**
     * maximum *WebSocket* frame size sent by the client. If the STOMP frame
     * is bigger than this value, the STOMP frame will be sent using multiple
     * WebSocket frames (default is 16KiB)
     * @type {number}
     */
    private maxWebSocketFrameSize;
    private subscriptions;
    constructor(ws: WebSocket);
    readonly receipts: Observable<StompFrame>;
    readonly messages: Observable<StompFrameMessage>;
    readonly errors: Observable<StompFrameError>;
    readonly onConnect: Observable<StompFrame>;
    connect(config?: StompConfig): void;
    /**
     * [DISCONNECT Frame](http://stomp.github.com/stomp-specification-1.1.html#DISCONNECT)
     * @param disconnectCallback
     * @param headers
     */
    disconnect(disconnectCallback: () => {}, headers: Map<string, string>): void;
    /**
     * [SEND Frame](http://stomp.github.com/stomp-specification-1.1.html#SEND)
     * @param destination
     * @param headers
     * @param body
     */
    send(destination: string, body: string): void;
    /**
     * [SUBSCRIBE Frame](http://stomp.github.com/stomp-specification-1.1.html#SUBSCRIBE)
     * @param destination
     * @param callback
     * @param headers
     */
    subscribe(destination: string, headers?: Map<string, string>): MessageSubscription;
    /**
     * [UNSUBSCRIBE Frame](http://stomp.github.com/stomp-specification-1.1.html#UNSUBSCRIBE)
     * @param sub
     */
    unsubscribe(sub: MessageSubscription): void;
    /**
     * [ABORT Frame](http://stomp.github.com/stomp-specification-1.1.html#ABORT)
     * @param transaction
     */
    abort(transaction: string): void;
    /**
     * [BEGIN Frame](http://stomp.github.com/stomp-specification-1.1.html#BEGIN)
     * @param transaction
     */
    begin(transaction?: string): {
        id: string;
        commit: () => void;
        abort: () => void;
    };
    /**
     * [COMMIT Frame](http://stomp.github.com/stomp-specification-1.1.html#COMMIT)
     * @param transaction
     */
    commit(transaction: string): void;
    /**
     * [ACK Frame](http://stomp.github.com/stomp-specification-1.1.html#ACK)
     * @param id
     * @param transaction
     */
    ack(id: string, transaction?: string): void;
    /**
     * [NACK Frame](http://stomp.github.com/stomp-specification-1.1.html#NACK)
     * @param id
     * @param transaction
     */
    nack(id: string, transaction?: string): void;
    private cleanup();
    private handleFrame(frame);
    private onError(error);
    private transmit(command, headers, body?);
    private setupHeartbeat(frame);
    private sendHeartBeat();
    private debug(message, ...args);
}
