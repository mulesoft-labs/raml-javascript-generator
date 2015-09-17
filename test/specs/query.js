var test = require('blue-tape')
var ExampleApi = require('../.tmp/example')

test('query string', function (t) {
  var client = new ExampleApi()

  t.test('append query string', function (t) {
    function validateResponse (t) {
      return function (response) {
        t.equal(response.status, 200)
        t.equal(response.body, '/bounce/url?key=string')
      }
    }

    t.test('body argument (#get)', function (t) {
      t.test('should pass query string as an object', function (t) {
        return client.resources.bounce.url.get({ key: 'string' })
          .then(validateResponse(t))
      })

      t.test('should pass query string as a string', function (t) {
        return client.resources.bounce.url.get('key=string')
          .then(validateResponse(t))
      })
    })

    t.test('option argument (#post)', function (t) {
      t.test('should pass query string as an object', function (t) {
        var opts = { query: { key: 'string' } }

        return client.resources.bounce.url.post(null, opts)
          .then(validateResponse(t))
      })

      t.test('should pass query string as a string', function (t) {
        var opts = { query: 'key=string' }

        return client.resources.bounce.url.post(null, opts)
          .then(validateResponse(t))
      })
    })
  })

  t.test('types', function (t) {
    t.test('array', function (t) {
      t.test('should stringify with multiple keys', function (t) {
        return client.resources.bounce.url.get({
          key: [1, 2, 3]
        })
          .then(function (response) {
            t.equal(response.status, 200)
            t.equal(response.body, '/bounce/url?key=1&key=2&key=3')
          })
      })
    })
  })
})
