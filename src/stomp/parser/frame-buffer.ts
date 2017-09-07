

import {StompFrame} from '../frames/stomp-frame';

export interface FrameBuffer {
    frames: StompFrame[];
    partial: string;
}
