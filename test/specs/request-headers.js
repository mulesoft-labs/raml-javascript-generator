var test = require('blue-tape')
var ExampleApi = require('../.tmp/example')

test('request headers', function (t) {
  var client = new ExampleApi()

  t.test('custom headers', function (t) {
    t.test('should pass custom headers with the request', function (t) {
      return client.resources.bounce.headers.get(null, {
        headers: { 'X-Custom-Header': 'Custom Header' }
      })
        .then(function (response) {
          t.equal(response.status, 200)
          t.equal(response.body['x-custom-header'], 'Custom Header')
        })
    })
  })

  t.test('default headers', function (t) {
    t.test('use defaults', function (t) {
      t.test('should use default headers from definition', function (t) {
        return client.resources.defaults.headers.get()
          .then(function (response) {
            t.equal(response.status, 200)
            t.equal(response.body['x-default-header'], 'Hello World!')
          })
      })
    })

    t.test('override defaults', function (t) {
      t.test('should override default headers', function (t) {
        return client.resources.defaults.headers.get(null, {
          headers: { 'x-default-header': 'Overridden' }
        })
          .then(function (response) {
            t.equal(response.status, 200)
            t.equal(response.body['x-default-header'], 'Overridden')
          })
      })
    })
  })
})
