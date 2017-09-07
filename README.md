[![CI Status](https://travis-ci.org/ElderByte-/ngx-stomp.svg?branch=master)](https://travis-ci.org/ElderByte-/ngx-stomp)
[![npm version](https://badge.fury.io/js/%40elderbyte%2Fngx-stomp.svg)](https://badge.fury.io/js/%40elderbyte%2Fngx-stomp)

# Angular Stomp

Simple angular stomp library.


## Installation

To install this library, run:

```bash
$ npm install @elderbyte/ngx-stomp --save
```

## Consuming your library

Once you have published your library to npm, you can import your library in any Angular application by running:

```bash
$ npm install @elderbyte/ngx-stomp
```

and then from your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Import your library
import { StompModule } from '@elderbyte/ngx-stomp';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // Specify your library as an import
    StompModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Once your library is imported, you can use its components, directives and pipes in your Angular application.

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
