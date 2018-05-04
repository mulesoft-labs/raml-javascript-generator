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
    reporters: ['progress', 'istanbul'],
    istanbulReporter: {
      dir : 'coverage/',
      reporters: [
        // reporters not supporting the `file` property 
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' },
        // reporters supporting the `file` property, use `subdir` to directly 
        // output them in the `dir` directory 
        { type: 'cobertura', subdir: '.', file: 'cobertura.txt' },
        { type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' },
        { type: 'teamcity', subdir: '.', file: 'teamcity.txt' },
        { type: 'text', subdir: '.', file: 'text.txt' },
        { type: 'text-summary', subdir: '.', file: 'text-summary.txt' },
      ]
    },
    autoWatch: false,
    browsers: ['Chrome_headless'],
    singleRun: true,
  })
}
