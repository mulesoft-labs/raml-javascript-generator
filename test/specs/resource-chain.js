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

  t.test('root resource should work', function (t) {
    return client.resources.get().then(validateResponse(t))
  })

  t.test('uri parameter', function (t) {
    t.test('should dynamically generate the resource chain', function (t) {
      return client.resources.bounce.parameter.variable(123).get()
        .then(function (res) {
          t.equal(res.body, '123')
          t.equal(res.status, 200)
        })
    })
  })

  t.test('null uri parameter', function (t) {
    t.test('should output null values as an empty string', function (t) {
      return client.resources.bounce.parameter.variable(null).get()
        .then(function (res) {
          t.equal(res.body, null)
          t.equal(res.status, 200)
        })
    })
  })

  t.test('default uri parameter', function (t) {
    t.test('should use the default value when null', function (t) {
      return client.resources.defaults.parameter.variable(null).get()
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
      t.test('should support arguments', function (t) {
        return client.resources.parameters.prefix.one(123).get()
          .then(validateResponse(t))
      })

      t.test('should not support more arguments than defined', function (t) {
        return client.resources.parameters.prefix.one(123, 456).get()
          .then(validateResponse(t))
      })
    })

    t.test('multiple parameters', function (t) {
      t.test('should dynamically generate the resource chain', function (t) {
        return client.resources.parameters.prefix.three(1, 2, 3).get()
          .then(function (res) {
            t.equal(res.body, '123')
            t.equal(res.status, 200)
          })
      })
    })
  })

  t.test('extensions', function (t) {
    t.test('static extension', function (t) {
      t.test('should support extensions in the resource chain', function (t) {
        return client.resources.extensions.static.json.get()
          .then(validateResponse(t))
      })
    })

    t.test('media type extension', function (t) {
      t.test('basic', function (t) {
        t.test('should support mediaTypeExtension parameter', function (t) {
          return client.resources.extensions.mediaType.basic
            .mediaTypeExtension('json').get()
            .then(validateResponse(t))
        })
      })

      t.test('enum', function (t) {
        t.test('should have paths from enum values', function (t) {
          return client.resources.extensions.mediaType.enum.json.get()
            .then(validateResponse(t))
        })
      })

      t.test('enum with period', function (t) {
        t.test('should have paths from period prefixed enum values', function (t) {
          return client.resources.extensions.mediaType.enumPeriod.xml.get()
            .then(validateResponse(t))
        })
      })
    })
  })

  t.test('conflicts', function (t) {
    t.test('media type extension', function (t) {
      t.test('should handle original route', function (t) {
        return client.resources.conflicts.mediaType.route.get()
          .then(validateResponse(t))
      })

      t.test('should handle conflict with media type extension', function (t) {
        return client.resources.conflicts.mediaType
          .mediaTypeExtension('json').get()
          .then(validateResponse(t))
      })
    })
  })
})
