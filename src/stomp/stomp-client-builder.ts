
import * as SockJS from 'sockjs-client';
import {StompClient} from './stomp-client';


export class StompClientBuilder {

    /**
     * Builds a Stomp client using SockJs as transport
     * @param {string} url
     */
    public static clientSockJs(url: string) {
        const sockJs = new SockJS(url);
        return this.clientOver(<any>sockJs);
    }

    /**
     * Builds a Stomp client using default browser websocket as transport
     * @param {string} url
     * @param {string[]} protocols
     * @returns {StompClient}
     */
    public static client(url: string, protocols: string[] = ['v10.stomp', 'v11.stomp']) {
        let ws = new WebSocket(url, protocols);
        return StompClientBuilder.clientOver(ws);
    }

    /**
     * Builds a Stomp client using the given websocket implementation
     * @param {WebSocket} ws
     * @returns {StompClient}
     */
    public static clientOver(ws: WebSocket) {
        return new StompClient(ws);
    }
}
