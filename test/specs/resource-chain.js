var test = require('blue-tape')
var ExampleApi = require('../.tmp/example')

test('resource chain', function (t) {
  var client = new ExampleApi()

  function validateResponse (t) {
    return function (response) {
      t.equal(response.body, 'Success')
      t.equal(response.status, 200)
    }
  }

  t.test('root resource work', function (t) {
    return client.get().then(validateResponse(t))
  })

  t.test('uri parameter', function (t) {
    t.test('dynamically generate the resource chain', function (t) {
      return client.bounce.parameter.variable({ variable: 123 }).get()
        .then(function (res) {
          t.equal(res.body, '123')
          t.equal(res.status, 200)
        })
    })
  })

  t.test('null uri parameter', function (t) {
    t.test('output null values as an empty string', function (t) {
      return client.bounce.parameter.variable(null).get()
        .then(function (res) {
          t.equal(res.body, null)
          t.equal(res.status, 200)
        })
    })
  })

  t.test('default uri parameter', function (t) {
    t.test('use the default value when null', function (t) {
      return client.defaults.parameter.variable(null).get()
        .then(function (res) {
          t.equal(res.body, 'default')
          t.equal(res.status, 200)
        })
    })
  })

  t.test('prefixed uri parameter', function (t) {
    function validateResponse (t) {
      return function (res) {
        t.equal(res.body, '123')
        t.equal(res.status, 200)
      }
    }

    t.test('single parameter', function (t) {
      return client.parameters.prefix.one({ id: 123 }).get()
        .then(validateResponse(t))
    })

    t.test('multiple parameters', function (t) {
      return client.parameters.prefix.three({ a: 1, b: 2, c: 3 }).get()
        .then(function (res) {
          t.equal(res.body, '123')
          t.equal(res.status, 200)
        })
    })
  })

  t.test('extensions', function (t) {
    t.test('static extension', function (t) {
      t.test('support extensions in the resource chain', function (t) {
        return client.extensions.static.json.get()
          .then(validateResponse(t))
      })
    })

    t.test('media type extension', function (t) {
      t.test('basic', function (t) {
        t.test('support mediaTypeExtension parameter', function (t) {
          return client.extensions.mediaType.basic({ mediaTypeExtension: '.json' }).get()
            .then(validateResponse(t))
        })
      })

      t.test('enum', function (t) {
        t.test('have paths from enum values', function (t) {
          return client.extensions.mediaType.enum({ mediaTypeExtension: '.json' }).get()
            .then(validateResponse(t))
        })
      })
    })
  })

  t.test('conflicts', function (t) {
    t.test('media type extension', function (t) {
      t.test('handle original route', function (t) {
        return client.conflicts.mediaType.route.get()
          .then(validateResponse(t))
      })

      t.test('handle conflict with media type extension', function (t) {
        return client.conflicts.mediaType({ mediaTypeExtension: '.json' }).get()
          .then(validateResponse(t))
      })
    })
  })
})
