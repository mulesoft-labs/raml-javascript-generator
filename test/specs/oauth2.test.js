const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

describe('oauth2', () => {
  const oauth2 = ExampleApi.Security.oauth2_0({
    clientId: '123',
    clientSecret: 'abc',
    redirectUri: 'http://example.com/auth/callback'
  });

  it('#getUri should return a valid uri', () => {
    expect(
      oauth2.code.getUri()).to.equal(
      'https://localhost:4567/auth/oauth2/authorize?' +
      'client_id=123&redirect_uri=http%3A%2F%2Fexample.com%2Fauth%2Fcallback&' +
      'scope=user&response_type=code'
    );
  });

  it('user object should sign requests', () => {
    const client = new ExampleApi({
      user: oauth2.createToken('abc', null, 'Bearer')
    });

    return client.bounce.headers.get()
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.authorization).to.equal('Bearer abc');
      });
  });
});
