var test = require('blue-tape')
var ExampleApi = require('../.tmp/example')

test('response body', function (t) {
  var client = new ExampleApi()

  t.test('response content types', function (t) {
    t.test('text', function (t) {
      t.test('should respond as text when unknown', function (t) {
        return client.resources.responses.text.get()
          .then(function (response) {
            t.equal(response.status, 200)
            t.equal(response.body, 'text')
          })
      })
    })

    t.test('json', function (t) {
      t.test('should parse as JSON when specified', function (t) {
        return client.resources.responses.json.get()
          .then(function (response) {
            t.equal(response.status, 200)
            t.deepEqual(response.body, { json: true })
          })
      })
    })

    t.test('url encoded', function (t) {
      t.test('simple query string', function (t) {
        t.test('should parse', function (t) {
          return client.resources.responses.urlEncoded.basic.get()
            .then(function (response) {
              t.equal(response.status, 200)
              t.deepEqual(response.body, { key: 'value' })
            })
        })
      })

      t.test('duplicate keys', function (t) {
        t.test('should put duplicate keys into an array', function (t) {
          return client.resources.responses.urlEncoded.duplicate.post()
            .then(function (response) {
              t.equal(response.status, 200)
              t.deepEqual(response.body, { key: ['1', '2', '3'] })
            })
        })
      })

      t.test('encoded values', function (t) {
        t.test('should be uri decoded', function (t) {
          return client.resources.responses.urlEncoded.escaped.put()
            .then(function (response) {
              t.equal(response.status, 200)
              t.deepEqual(response.body, { key: 'Hello, world!' })
            })
        })
      })
    })
  })
})
