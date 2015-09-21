var test = require('blue-tape')
var ExampleApi = require('../.tmp/example')

test('oauth2', function (t) {
  var oauth2 = ExampleApi.Security.oauth2_0({
    clientId: '123',
    clientSecret: 'abc',
    redirectUri: 'http://example.com/auth/callback'
  })

  t.test('#getUri should return a valid uri', function (t) {
    t.equal(
      oauth2.code.getUri(),
      'https://localhost:4567/auth/oauth2/authorize?' +
      'client_id=123&redirect_uri=http%3A%2F%2Fexample.com%2Fauth%2Fcallback&' +
      'scope=user&response_type=code'
    )

    t.end()
  })

  t.test('user object should sign requests', function (t) {
    var client = new ExampleApi({
      user: oauth2.createToken('abc', null, 'Bearer')
    })

    return client.resources.bounce.headers.get()
      .then(function (response) {
        t.equal(response.status, 200)
        t.equal(response.body.authorization, 'Bearer abc')
      })
  })
})
