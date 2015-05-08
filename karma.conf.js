var join = require('path').join
var isTravis = require('is-travis')

var EXAMPLE_CLIENT_DIR = 'test/.tmp/example'

module.exports = function (config) {
  config.set({
    basePath: __dirname,
    frameworks: ['mocha', 'sinon-chai'],
    preprocessors: {},
    files: [
      'node_modules/es6-promise/dist/es6-promise.js',
      'test/support/globals.js',
      join(EXAMPLE_CLIENT_DIR, 'node_modules/popsicle/popsicle.js'),
      join(EXAMPLE_CLIENT_DIR, 'node_modules/client-oauth2/client-oauth2.js'),
      join(EXAMPLE_CLIENT_DIR, 'index.js'),
      'test/browser/**/*.js'
    ],
    exclude: [],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: isTravis ? ['PhantomJS'] : ['Chrome', 'Firefox', 'PhantomJS'],
    captureTimeout: 60000,
    singleRun: false
  })
}
