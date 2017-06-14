import { Observable } from "rxjs/Observable";
export declare class WebsocketRx {
    private socket;
    private socketChannel;
    constructor(url: string);
    readonly messages: Observable<MessageEvent>;
    send(data: any): void;
    close(): void;
    private connect(url);
    private create(ws);
}
