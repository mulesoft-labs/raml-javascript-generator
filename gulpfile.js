var gulp = require('gulp')
var join = require('path').join
var karma = require('karma').server
var exec = require('child_process').exec
var spawn = require('child_process').spawn
var server = require('./test/support/server')

var MOCHA_BIN_PATH = join(__dirname, 'node_modules/mocha/bin/_mocha')
var CLIENT_OUT_DIR = join(__dirname, 'test/.tmp')
var RAML_CLIENT_SCRIPT = join(__dirname, 'bin/raml-javascript-generator.js')

gulp.task('server', function (done) {
  var app = server.listen(4444, done)

  function close () {
    app.close()

    gulp.removeListener('err', close)
    gulp.removeListener('stop', close)
  }

  gulp.on('err', close)
  gulp.on('stop', close)
})

gulp.task('generate', function (done) {
  var output = join(CLIENT_OUT_DIR, 'example')

  var cmd = [
    'node',
    RAML_CLIENT_SCRIPT,
    join(__dirname, 'test/support/fixtures/example.raml'),
    '-o ' + output
  ].join(' ')

  exec(cmd, function (err, stdout, stderr) {
    if (err) {
      return done(err)
    }

    process.stdout.write(stdout)
    process.stderr.write(stderr)

    exec('cd ' + output + ' && npm install', done)
  })
})

gulp.task('test:node', [
  'server',
  'generate'
], function () {
  var testProcess = spawn(MOCHA_BIN_PATH, [
    join(__dirname, 'test/node/**/*.js'),
    '-R',
    'spec',
    '--require',
    join(__dirname, 'test/support/globals.js')
  ])

  testProcess.stdout.pipe(process.stdout)
  testProcess.stderr.pipe(process.stderr)

  return testProcess.stdout
})

gulp.task('test:browser', [
  'server',
  'generate'
], function (done) {
  var opts = {
    singleRun: true,
    configFile: join(__dirname, 'karma.conf.js')
  }

  return karma.start(opts, done)
})

gulp.task('test', [
  'test:node',
  'test:browser'
])
