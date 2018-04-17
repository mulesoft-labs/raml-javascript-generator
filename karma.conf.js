const istanbul = require('browserify-istanbul');

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['browserify', 'mocha'],
    files: [
      'test/specs/*test.js'
    ],
    browserify: {
      debug: true,
      ignore: [],
      transform: [istanbul({
        ignore: ['test/**', '**/node_modules/**']
      })],
      extensions: ['.js']
    },
    customLaunchers: {
      Chrome_headless: {
        base: 'Chrome',
        flags: ['--no-sanbox']
      }
    },
    preprocessors: {
      'test/specs/*test.js': ['browserify']
    },
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },
    reporters: ['progress', 'coverage'],
    autoWatch: false,
    browsers: ['Chrome_headless'],
    singleRun: true,
  })
}
