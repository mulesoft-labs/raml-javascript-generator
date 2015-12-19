var test = require('blue-tape')
var ExampleApi = require('../.tmp/example')

test('response headers', function (t) {
  var client = new ExampleApi()

  t.test('should return in a lower-cased object', function (t) {
    return client.get()
      .then(function (res) {
        t.equal(res.body, 'Success')
        t.equal(res.status, 200)
        t.equal(res.headers['content-type'], 'text/html; charset=utf-8')
      })
  })
})
