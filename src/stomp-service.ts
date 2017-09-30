

import {Injectable} from '@angular/core';
import {StompClient} from './stomp/stomp-client';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {StompClientBuilder} from './stomp/stomp-client-builder';
import {NGXLogger} from 'ngx-logger';


export class StompConfiguration {

    /**
     * The websocket / sockJS endpoint
     */
    public endpointUrl: string;

    /**
     * Use SockJS as transport handler. (default false)
     * If not used, standard browser websocket connection is used.
     */
    public withSockJs?: boolean;
}


/**
 * The stomp service manages a single STOMP endpoint connection.
 */
@Injectable()
export class StompService {

    /***************************************************************************
     *                                                                         *
     * Fields                                                                  *
     *                                                                         *
     **************************************************************************/

    private _client: StompClient;
    private _onConnectedSubject = new ReplaySubject<StompClient>(1);

    /***************************************************************************
     *                                                                         *
     * Constructor                                                             *
     *                                                                         *
     **************************************************************************/

    constructor(
        private logger: NGXLogger,
        private configuration: StompConfiguration) {
        this.connectStomp();
    }

    /***************************************************************************
     *                                                                         *
     * Public API                                                              *
     *                                                                         *
     **************************************************************************/

    /**
     * Gets the new connected stomp client.
     * This is a good point to hook up your subscriptions.
     *
     * @returns {Observable<StompClient>}
     */
    public get connectedClient(): Observable<StompClient> {
        return this._onConnectedSubject;
    }

    /***************************************************************************
     *                                                                         *
     * Private methods                                                         *
     *                                                                         *
     **************************************************************************/

    private connectStomp(): void {

        this._client = this.openConnection();

        this._client.errors.subscribe(m => {
            this.logger.warn('Got STOMP ERROR!', m);
        }, err => {
            this.logger.error('Error while attempting to get ERROR!', err);
        });

        this._client.onConnect.subscribe(con => {
            this.logger.info('Got STOMP connection - > adding subscriptions!', con);
            this._onConnectedSubject.next(this._client);
        }, err => {
            this.logger.error('Error while attempting to connect!', err);
            this._onConnectedSubject.error(err);
        });

        this.logger.info('Attempting to connect to STOMP ...');
        this._client.connect();
    }


    private openConnection(): StompClient {
       return StompClientBuilder.start(this.logger, this.configuration.endpointUrl)
            .enableSockJS(this.configuration.withSockJs)
            .build();
    }


    private buildSockJsUrl(path: string) {
        return this.toAbsoluteUrl(path);
    }

    private buildWebSocketUrl(path: string): string {
        let socketEndpoint = this.toAbsoluteUrl(path);
        socketEndpoint = socketEndpoint.replace('http://', 'ws://');
        socketEndpoint = socketEndpoint.replace('https://', 'wss://');
        // let socketEndpoint = "ws://172.16.29.1:8080/stomp/websocket"; // SockJS
        return socketEndpoint;
    }

    private toAbsoluteUrl(url: string): string {
        if (!url.startsWith('http://')) {
            if (!url.startsWith('/')) {
                url =  '/' + url; // Ensure relative url starts with slash
            }
            return window.location.protocol + '//' + window.location.host + url;
        }
        return url;
    }

}
