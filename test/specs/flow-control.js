var test = require('blue-tape')
var ExampleApi = require('../.tmp/example')

/**
 * Array of test methods.
 *
 * @type {Array}
 */
var METHODS = ['get', 'post', 'put', 'patch', 'delete']

test('flow control', function (t) {
  var client = new ExampleApi()

  t.test('promise methods', function (t) {
    METHODS.forEach(function (method) {
      t.test('#' + method + ' #then should resolve', function (t) {
        return client.hello[method]()
          .then(function (response) {
            t.equal(response.body, 'Hello World!')
            t.equal(response.status, 200)
            t.ok(typeof response.headers === 'object')
          })
      })
    })
  })

  t.test('reuse request', function (t) {
    t.test('should reuse the promise', function (t) {
      var request = client.hello.get()

      return request.then(function (response) {
        return request.then(function (response2) {
          t.equal(response, response2)
        })
      })
    })

    t.test('should reuse for exec', function (t) {
      var request = client.hello.get()

      request.then(function (response) {
        return request.exec(function (err, response2) {
          t.equal(response, response2)

          t.end(err)
        })
      })
    })
  })

  t.test('Promise#all should resolve', function (t) {
    return Promise
      .all([
        client.hello.get(),
        client.hello.post()
      ])
      .then(function (responses) {
        var get = responses[0]
        var post = responses[1]

        t.equal(get.body, 'Hello World!')
        t.equal(get.status, 200)
        t.ok(typeof get.headers === 'object')

        t.equal(post.body, 'Hello World!')
        t.equal(post.status, 200)
        t.ok(typeof post.headers === 'object')
      })
  })

  t.test('#exec should callback', function (t) {
    client.hello.get()
      .exec(function (err, response) {
        t.equal(response.body, 'Hello World!')
        t.equal(response.status, 200)
        t.ok(typeof response.headers === 'object')

        t.end(err)
      })
  })
})
