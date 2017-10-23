[![CI Status](https://travis-ci.org/ElderByte-/ngx-stomp.svg?branch=master)](https://travis-ci.org/ElderByte-/ngx-stomp)
[![npm version](https://badge.fury.io/js/%40elderbyte%2Fngx-stomp.svg)](https://badge.fury.io/js/%40elderbyte%2Fngx-stomp)

# Angular Stomp

Simple Angular (4+) STOMP over Websocket library.

## Features

* Supports native websocket transport
* Supports SockJS emulated websocket transport


## Consuming your library

To install this library, run:

```bash
$ npm install @elderbyte/ngx-stomp --save
```

and then from your Angular `AppModule`:

```typescript

// Import your library
import { StompModule } from '@elderbyte/ngx-stomp';

@NgModule({
  imports: [
    // Configure StompModule
    StompModule.forRoot({
      endpointUrl: '/stomp',
      withSockJs: true
    }),
  ],
})
export class AppModule { }
```

Once your library is imported, you can use the `StompService` by importing it into your own services / components:

```typescript
export class MyStompUsage {
  constructor(
    private logger: NGXLogger,
    private stompService : StompService) {
    
    const topic = '/topic/metadata/changed';

    // Subscribe to the STOMP topic ...

    this.stompService.connectedClient
      .subscribe(client => {
        const sub = client.subscribe(topic);
       
        // Subscription successful -> now we can listen to messages sent to this subscription

        sub.messages.subscribe(m => {
         
          // We got a message m, do something with it
          
          this.onMediaChanged(m.bodyJson);
          
          
        }, err => {
          this.logger.error('Got filtered STOMP topic error!', err);
        })
      }, err => {
        this.logger.error('STOMP: Failed to subscribe!', err);
      });
  }
}
```

  



## Development

To generate all `*.js`, `*.d.ts` and `*.metadata.json` files:

```bash
$ npm run build
```

To lint all `*.ts` files:

```bash
$ npm run lint
```

## License

MIT © [ElderByte AG](mailto:info@elderbyte.com)
