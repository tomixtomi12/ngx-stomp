import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import {StompFrameMessage} from './frames/stomp-frame-message';


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