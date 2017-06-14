export default {
  entry: 'dist/index.js',
  dest: 'dist/bundles/ngx-stomp.umd.js',
  sourceMap: false,
  format: 'umd',
  moduleName: 'ng.ngxStomp',
  globals: {
    '@angular/core': 'ng.core'
  },
  onwarn: function (warning) {
    // Suppress this error message... there are hundreds of them. Angular team says to ignore it.
    // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
    if (warning.code === 'THIS_IS_UNDEFINED'){
            return;
    }
    console.error(warning.message);
  }
}
