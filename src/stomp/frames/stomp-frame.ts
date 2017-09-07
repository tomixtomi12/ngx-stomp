
import {StompCommand} from '../stomp-command';


export class StompFrame {

    private _command: StompCommand;
    private _body: string | null = null;
    private _headers: Map<string, string>;

    public static build(command: StompCommand, headers: Map<string, string>, body?: string): StompFrame {
        return new StompFrame(command, body ? body : null, headers);
    }

    constructor(
        command: StompCommand,
        body: string | null,
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

    public get body(): string | null {
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
        const value = this._headers.get(key);
        return value ? value : null;
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




