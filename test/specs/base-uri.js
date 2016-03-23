var nock = require('nock')
var test = require('blue-tape')
var sinon = require('sinon')
var ExampleApi = require('../.tmp/example')

test('base uri', function (t) {
  var server

  function validateResponse (t) {
    return function (response) {
      t.equal(response.body, 'Hello World!')
      t.equal(response.status, 200)
    }
  }

  if (process.browser) {
    t.test('before', function (t) {
      server = sinon.fakeServer.create()

      server.autoRespond = true

      server.respondWith('GET', 'http://test.com/hello', 'Hello World!')
      server.respondWith('GET', 'http://google.com/search/hello', 'Hello World!')

      t.end()
    })
  } else {
    t.test('before', function (t) {
      nock.enableNetConnect('localhost')

      nock('http://google.com')
        .get('/search/hello')
        .reply(200, 'Hello World!')

      nock('http://test.com')
        .get('/hello')
        .reply(200, 'Hello World!')

      t.end()
    })
  }

  t.test('set base uri', function (t) {
    var client = new ExampleApi({
      baseUri: 'http://google.com/search/'
    })

    t.test('should be able to manually set the base uri', function (t) {
      return client.hello.get()
        .then(validateResponse(t))
    })
  })

  t.test('base uri parameters', function (t) {
    var client = new ExampleApi({
      baseUri: 'http://{domain}.com',
      baseUriParameters: {
        domain: 'test'
      }
    })

    t.test('should be able to manually set the base uri', function (t) {
      return client.hello.get()
        .then(validateResponse(t))
    })
  })

  if (process.browser) {
    t.test('after', function (t) {
      server.restore()

      t.end()
    })
  }
})
