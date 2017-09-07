


import {StompFrame} from './stomp-frame';
import {StompCommand} from '../stomp-command';

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