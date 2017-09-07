/**
 * This codes based on https://github.com/aszechlicki/stomp-ts/tree/develop
 */

import {BYTE, StompFrameDeserializer, StompFrameSerializer} from './parser/stomp-frame-parser';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {StompFrame} from './frames/stomp-frame';
import {StompFrameMessage} from './frames/stomp-frame-message';
import {StompFrameError} from './frames/stomp-frame-error';
import {MessageSubscription} from './message-subscription';
import {StompCommand} from './stomp-command';


export class StompConfig {
    public headers = new Map<string, string>();
    public login?: string;
    public passcode?: string;
}


export class StompClient {

    /***************************************************************************
     *                                                                         *
     * Fields                                                                  *
     *                                                                         *
     **************************************************************************/

    public static readonly V1_0 = '1.0';
    public static readonly V1_1 = '1.1';
    public static readonly V1_2 = '1.2';
    public static readonly supportedVersions: '1.1,1.0';

    private frameSerializer = new StompFrameSerializer();
    private frameDeserializer = new StompFrameDeserializer();

    private counter = 0;
    private connected = false;
    private heartbeat = {
        outgoing: 10000,
        incoming: 10000
    };
    private serverActivity: number;
    private pinger: any;
    private ponger: any;
    private partialData: string;

    private _connectSubject = new Subject<StompFrame>();
    private receiptSubject = new Subject<StompFrame>();
    private messageSubject = new Subject<StompFrameMessage>();
    private errorSubject = new Subject<StompFrameError>();


    /**
     * maximum *WebSocket* frame size sent by the client. If the STOMP frame
     * is bigger than this value, the STOMP frame will be sent using multiple
     * WebSocket frames (default is 16KiB)
     * @type {number}
     */
    private maxWebSocketFrameSize = 16 * 1024;
    private subscriptions = new Map<string, MessageSubscription>();


    /***************************************************************************
     *                                                                         *
     * Constructor                                                             *
     *                                                                         *
     **************************************************************************/

    /**
     * Creates a new STOMP Client using the given websocket
     * @param {WebSocket} ws
     */
    constructor(private ws: WebSocket) {
        this.ws.binaryType = 'arraybuffer';

        console.log('socket state:', ws.readyState);
    }

    /***************************************************************************
     *                                                                         *
     * Public API                                                              *
     *                                                                         *
     **************************************************************************/

    public get connectSubject(): Subject<StompFrame> {
        return this._connectSubject;
    }

    public set connectSubject(value: Subject<StompFrame>) {
        this._connectSubject = value;
    }

    public get receipts(): Observable<StompFrame>{
        return this.receiptSubject;
    }

    public get messages(): Observable<StompFrameMessage>{
        return this.messageSubject;
    }

    public get errors(): Observable<StompFrameError>{
        return this.errorSubject;
    }

    public get onConnect(): Observable<StompFrame> {
        return this._connectSubject;
    }


    public connect(config?: StompConfig): void {

        if (!config) { config = new StompConfig(); }

        if (!config.headers) {
            config.headers = new Map<string, string>();
        }
        if (config.login) {
            config.headers.set('login', config.login);
        }
        if (config.passcode) {
            config.headers.set('passcode', config.passcode);
        }

        this.debug('Opening WebSocket...');

        this.ws.onmessage = (evt: MessageEvent) => {
            let unmarshalledData = this.frameDeserializer.deserializeMessage(evt.data);
            this.serverActivity = Date.now();
            unmarshalledData.frames.forEach(
                f => this.handleFrame(f)
            );
        };

        this.ws.onclose = () => {
            const message = `Lost connection to ${this.ws.url}`;
            this.debug(message);
            this.cleanup();

            this.onError(new StompFrameError(message));
        };

        this.ws.onopen = () => {
            this.debug('WebSocket opened. Attempting to connect to STOMP now...');

            let headers = new Map<string, string>();
            headers.set('accept-version', '1.2');
            headers.set('host', 'localhost');
            // headers.set('accept-version', Stomp.supportedVersions);
            // headers.set('heart-beat', [this.heartbeat.outgoing, this.heartbeat.incoming].join(','));

            this.transmit(StompCommand.CONNECT, headers);
        };
    }

    /**
     * [DISCONNECT Frame](http://stomp.github.com/stomp-specification-1.1.html#DISCONNECT)
     * @param disconnectCallback
     * @param headers
     */
    public disconnect(disconnectCallback: () => {}, headers: Map<string, string>): void {
        this.transmit(StompCommand.DISCONNECT, headers);
        this.ws.onclose = <any>null;
        this.ws.close();
        this.cleanup();
        disconnectCallback();
    }

    /**
     * [SEND Frame](http://stomp.github.com/stomp-specification-1.1.html#SEND)
     * @param destination
     * @param headers
     * @param body
     */
    public send(destination: string, body: string): void {
        let headers = new Map<string, string>();
        headers.set('destination', destination);
        this.transmit(StompCommand.SEND, headers, body);
    }

    /**
     * [SUBSCRIBE Frame](http://stomp.github.com/stomp-specification-1.1.html#SUBSCRIBE)
     * @param destination
     * @param callback
     * @param headers
     */
    public subscribe(destination: string, headers?: Map<string, string>): MessageSubscription {

        if (!headers) {
            headers = new Map<string, string>();
        }

        const headerId = headers.get('id');
        const subId = headerId ? headerId : `sub-${this.counter++}`;
        headers.set('id', subId);

        let sub = new MessageSubscription(subId, destination, this.messages);
        this.subscriptions.set(destination, sub);
        headers.set('destination', destination);
        headers.set('ack', 'auto');
        this.transmit(StompCommand.SUBSCRIBE, headers);

        return sub;
    }

    /**
     * [UNSUBSCRIBE Frame](http://stomp.github.com/stomp-specification-1.1.html#UNSUBSCRIBE)
     * @param sub
     */
    public unsubscribe(sub: MessageSubscription): void {
        let headers = new Map<string, string>();
        headers.set('id', sub.subscriptionId);
        this.subscriptions.delete(sub.subscriptionId);
        this.transmit(StompCommand.UNSUBSCRIBE, headers);
    }

    /**
     * [ABORT Frame](http://stomp.github.com/stomp-specification-1.1.html#ABORT)
     * @param transaction
     */
    public abort(transaction: string) {

        let headers = new Map<string, string>();
        headers.set('transaction', transaction);

        this.transmit(StompCommand.ABORT, headers);
    }

    /**
     * [BEGIN Frame](http://stomp.github.com/stomp-specification-1.1.html#BEGIN)
     * @param transaction
     */
    public begin(transaction?: string) {
        let txid = transaction || `tx-${this.counter++}`;

        let headers = new Map<string, string>();
        headers.set('transaction', txid);


        this.transmit(StompCommand.BEGIN, headers);
        return {
            id: txid,
            commit: () => {
                this.commit(txid);
            },
            abort: () => {
                this.abort(txid);
            }
        };
    }

    /**
     * [COMMIT Frame](http://stomp.github.com/stomp-specification-1.1.html#COMMIT)
     * @param transaction
     */
    public commit(transaction: string) {
        let headers = new Map<string, string>();
        headers.set('transaction', transaction);

        this.transmit(StompCommand.COMMIT, headers);
    }

    /**
     * [ACK Frame](http://stomp.github.com/stomp-specification-1.1.html#ACK)
     * @param id
     * @param transaction
     */
    public ack(id: string, transaction?: string) {
        let headers = new Map<string, string>();
        headers.set('id', id);
        if (transaction) {
            headers.set('transaction', transaction);
        }
        this.transmit(StompCommand.ACK, headers);
    }

    /**
     * [NACK Frame](http://stomp.github.com/stomp-specification-1.1.html#NACK)
     * @param id
     * @param transaction
     */
    public nack(id: string, transaction?: string) {
        let headers = new Map<string, string>();
        headers.set('id', id);
        if (transaction) {
            headers.set('transaction', transaction);
        }
        this.transmit(StompCommand.NACK, headers);
    }


    /***************************************************************************
     *                                                                         *
     * Private methods                                                         *
     *                                                                         *
     **************************************************************************/


    private cleanup() {
        this.connected = false;
        clearInterval(this.pinger);
        clearInterval(this.ponger);
    }

    private handleFrame(frame: StompFrame) {
        switch (frame.command) {
            // [CONNECTED Frame](http://stomp.github.com/stomp-specification-1.1.html#CONNECTED_Frame)
            case StompCommand.CONNECTED:
                this.debug(`connected to server `, frame.getHeader('server'));
                this.connected = true;
                this.setupHeartbeat(frame);
                this._connectSubject.next(frame);
                break;
            // [MESSAGE Frame](http://stomp.github.com/stomp-specification-1.1.html#MESSAGE)
            case StompCommand.MESSAGE:
                this.messageSubject.next(new StompFrameMessage(frame));
                break;
            // [RECEIPT Frame](http://stomp.github.com/stomp-specification-1.1.html#RECEIPT)
            case StompCommand.RECEIPT:
                this.receiptSubject.next(frame);
                break;
            case StompCommand.ERROR:
                this.onError(new StompFrameError(null, frame));
                this.debug('error received: ', frame);
                break;
            default:
                throw new Error(`not supported STOMP command '${frame.command}'`);
        }
    }

    private onError(error: StompFrameError) {
        this.errorSubject.next(error);
    }

    private transmit(command: StompCommand, headers: Map<string, string>, body?: string): void {
        let frame = StompFrame.build(command, headers, body);
        let out = this.frameSerializer.serialize(frame);
        this.debug('>>> ', out);
        while (out.length > this.maxWebSocketFrameSize) {
            this.ws.send(out.substring(0, this.maxWebSocketFrameSize));
            out = out.substring(this.maxWebSocketFrameSize);
            this.debug('remaining = ', out.length);
        }
        this.ws.send(out);
    }

    private setupHeartbeat(frame: StompFrame) {

        const version = frame.getHeader('version');

        if (!version || version === StompClient.V1_0) {
            return;
        }

        // heart-beat header received from the server looks like:
        // heart-beat: sx, sy
        const heartBeatHeader = frame.getHeader('heart-beat');

        if (heartBeatHeader) {
            const heartBeat = heartBeatHeader.split(',').map(parseInt);
            const serverIncoming = heartBeat[0];
            const serverOutgoing = heartBeat[1];

            if (this.heartbeat.outgoing > 0 && serverOutgoing > 0) {
                let ttl = Math.max(this.heartbeat.outgoing, serverOutgoing);
                this.debug(`Check PING every ${ttl}ms`);

                this.pinger = setInterval(() => {
                    this.sendHeartBeat();
                }, ttl);
            }

            if (this.heartbeat.incoming > 0 && serverIncoming > 0) {
                let ttl = Math.max(this.heartbeat.incoming, serverIncoming);
                this.debug(`check PONG every ${ttl}ms`);
                this.ponger = setInterval(() => {
                    let delta = Date.now() - this.serverActivity;
                    if (delta > ttl * 2) {
                        this.debug(`Did not receive server activity for the last ${delta}ms`);
                        this.ws.close();
                    }
                }, ttl);
            }
        }
    }

    private sendHeartBeat(): void {
        this.ws.send(BYTE.LF);
        this.debug('>>> PING');
    }

    private debug(message: string, ...args: any[]) {
        console.log(message, args);
    }
}
