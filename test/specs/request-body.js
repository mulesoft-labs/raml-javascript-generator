var test = require('blue-tape')
var ExampleApi = require('../.tmp/example')

test('request body', function (t) {
  var client = new ExampleApi()

  var REQUEST_BODY = {
    username: 'blakeembrey',
    password: 'hunter2'
  }

  function validateResponse (t) {
    return function (response) {
      t.equal(response.status, 200)
      t.deepEqual(response.body, REQUEST_BODY)
    }
  }

  t.test('basic request bodies', function (t) {
    t.test('json', function (t) {
      t.test('should default to json', function (t) {
        return client.resources.bounce.body.post(REQUEST_BODY)
          .then(validateResponse(t))
      })

      t.test('should stringify as json when specified', function (t) {
        return client.resources.bounce.body.post(REQUEST_BODY, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(validateResponse(t))
      })
    })

    t.test('url encoded form', function (t) {
      t.test('should stringify as a form when set', function (t) {
        return client.resources.bounce.body.post(REQUEST_BODY, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .then(validateResponse(t))
      })
    })

    t.test('primitives', function (t) {
      t.test('strings', function (t) {
        t.test('should send the body as set', function (t) {
          return client.resources.bounce.body.post('test')
            .then(function (response) {
              t.equal(response.body, 'test')
              t.equal(response.status, 200)
            })
        })
      })

      t.test('numbers', function (t) {
        t.test('should send the body as a string', function (t) {
          return client.resources.bounce.body.post(10)
            .then(function (response) {
              t.equal(response.body, '10')
              t.equal(response.status, 200)
            })
        })
      })

      t.test('null', function (t) {
        t.test('should not send a body', function (t) {
          return client.resources.bounce.body.post(null)
            .then(function (response) {
              t.equal(response.body, null)
              t.equal(response.status, 200)
            })
        })
      })
    })
  })
})
