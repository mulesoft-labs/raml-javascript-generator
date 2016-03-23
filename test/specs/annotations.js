var test = require('blue-tape')
var ExampleApi = require('../.tmp/example')

test('annotations', function (t) {
  var client = new ExampleApi()

  t.test('method name annotation', function (t) {
    return client.getRoot()
      .then(function (res) {
        t.equal(res.body, 'Success')
      })
  })
})
