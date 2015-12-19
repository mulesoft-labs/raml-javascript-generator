var methods = process.browser ? ['get', 'post', 'put', 'patch', 'delete'] : require('methods')
var camelCase = require('camel-case')
var test = require('blue-tape')
var ExampleApi = require('../.tmp/example')

test('custom resource', function (t) {
  var client = new ExampleApi()

  methods.forEach(function (verb) {
    if (verb === 'connect' || verb === 'head') {
      return
    }

    t.test('method "' + verb + '" should work', function (t) {
      return client(verb, '/status/{id}', { uriParameters: { id: 200 } })
        .then(function validateResponse (response) {
          t.equal(response.body, 'Success')
          t.equal(response.status, 200)
        })
    })
  })
})
