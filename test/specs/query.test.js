const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

describe('query string', () => {
  const client = new ExampleApi();

  describe('append query string', () => {
    function validateResponse() {
      return (response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.equal('/bounce/url?key=string');
      };
    }

    describe('body argument (#get)', () => {
      it('should pass query string as an object', () => client.bounce.url.get({ key: 'string' })
        .then(validateResponse()));

      it('should pass query string as a string', () => client.bounce.url.get('key=string')
        .then(validateResponse()));
    });

    describe('option argument (#post)', () => {
      it('should pass query string as an object', () => {
        const opts = { query: { key: 'string' } };

        return client.bounce.url.post(null, opts)
          .then(validateResponse());
      });

      it('should pass query string as a string', () => {
        const opts = { query: 'key=string' };

        return client.bounce.url.post(null, opts)
          .then(validateResponse());
      });
    });
  });
});
