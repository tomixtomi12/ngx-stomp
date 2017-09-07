
import {Observable} from 'rxjs/Rx';

export interface FrameBuffer {
  frames: StompFrame[];
  partial: string;
}

export class MessageSubscription {

  constructor(
    private _id: string,
    private _destination: string,
    private _messages: Observable<StompFrameMessage>) {

  }

  /**
   * Gets the internal subscription id
   * @returns {string}
   */
  public get subscriptionId(): string{ return this._id; }

  /**
   * Gets the subsription destionation
   * @returns {string}
   */
  public get destination(): string{ return this._destination; }

  /**
   * Gets an observable stream of all messages of this subscription.
   */
  public get messages(): Observable<StompFrameMessage> {
    return this._messages
        .filter(m => m.subscriptionId === this.subscriptionId);
  }
}


export enum StompCommand {
  ACK,
  NACK,
  ABORT,
  BEGIN,
  COMMIT,
  CONNECT,
  CONNECTED,
  DISCONNECT,
  MESSAGE,
  RECEIPT,
  SUBSCRIBE,
  UNSUBSCRIBE,
  SEND,
  ERROR
}


export class StompFrame {




    private _command: StompCommand;
    private _body: string = null;
    private _headers: Map<string, string>;

    public static build(command: StompCommand, headers: Map<string, string>, body: string): StompFrame {
        return new StompFrame(command, body, headers);
    }

    constructor(
        command: StompCommand,
        body: string,
        headers?: Map<string, string>) {

        if (!command) { throw new Error('ArgumentNullException: "command"'); }

        this._command = command;
        this._body = body;

        if (headers) {
            this._headers = new Map(headers);
        }else {
            this._headers = new Map<string, string>();
        }
    }

    public get command(): StompCommand {
        return this._command;
    }

    public get body(): string {
        return this._body;
    }

    public get bodyJson(): any {
        if (this._body) {
            return JSON.parse(this._body);
        }
        return null;
    }

    /**
     * Gets the header value with the given key if available.
     * Otherwise, returns null.
     *
     * @param key
     * @returns {undefined|string}
     */
    public getHeader(key: string): string | null {
        return this._headers.get(key);
    }

    /**
     *  Gets the header value with the given key if available.
     *  Otherwise, throws an exception.
     *
     * @param key
     * @returns {string}
     */
    public getRequiredHeader(key: string): string {
        let header = this.getHeader(key);
        if (header) {
            return header;
        }
        throw new Error('The required header ' + key + ' was not present in the frame!');
    }

    public setHeader(key: string, value: string): void {
        this._headers.set(key, value);
    }

    public foreachHeader(callbackfn: (value: string, key: string) => void): void {
        this._headers.forEach(callbackfn);
    }

    public get headers(): Map<string, string>{ return this._headers; }
}

export class StompFrameMessage extends StompFrame {
  constructor(frame: StompFrame) {
    super(frame.command, frame.body, frame.headers);
  }

  public get messageId(): string {
    return this.getRequiredHeader('message-id');
  }

  public get destination(): string {
    return this.getRequiredHeader('destination');
  }

  public get subscriptionId(): string {
    return this.getRequiredHeader('subscription');
  }
}

export class StompFrameError extends StompFrame {

  constructor(message: string, frame?: StompFrame) {
    super(StompCommand.ERROR, frame != null ? frame.body : null, frame != null ? frame.headers : null);
    if (message) {
      this.setHeader('message', message);
    }
  }

  public get errorMessage(): string {
    return this.getHeader('message');
  }

  public get errorDetail(): string {
    return this.body;
  }
}
