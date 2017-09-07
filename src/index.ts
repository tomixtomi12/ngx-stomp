
import {ModuleWithProviders, NgModule} from '@angular/core';
import {StompConfiguration, StompService} from './stomp-service';

export * from './stomp-service';
export * from './socket/index';
export * from './stomp/index';


@NgModule({
    imports : [ ]
})
export class StompModule {
    static forRoot(stompConfig: StompConfiguration): ModuleWithProviders {
        return {
            ngModule: StompModule,
            providers: [
                { provide: StompConfiguration, useValue: stompConfig },
                StompService
            ]
        };
    }
}
