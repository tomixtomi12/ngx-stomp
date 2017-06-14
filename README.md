[![CI Status](https://travis-ci.org/ElderByte-/ngx-stomp.svg?branch=master)](https://travis-ci.org/ElderByte-/ngx-stomp)
[![npm version](https://badge.fury.io/js/%40elderbyte%2Fngx-stomp.svg)](https://badge.fury.io/js/%40elderbyte%2Fngx-stomp)

# Angular Stomp

Simple angular stomp library.

## Using

Install via npm
```
npm i @elderbyte/ngx-stomp --save
```

Import via JS import statement

```
import {Stomp} from "@elderbyte/ngx-stomp";
```

## Development

After you have added and tested a new feature, publish a new version on npm:

1. Increment the version in `package.json` and `dist/package.json` - they must have the same version
2. Build the library into the `/dist` directory by running `npm run build` from the project root directory.
3. Commit the compiled `/dist` changes
4. Run `npm publish dist --access=public` from the project root directory or `npm publish --access=public` from within the dist directory.

**Note** `--access=public` is only neccessary if you publish the package the **first time**. If you omit this parameter the first time, you'll get a error message that you need a paid account.


## License

MIT
