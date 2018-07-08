const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

/**
 * Array of test methods.
 *
 * @type {Array}
 */
const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

describe('flow control', () => {
  const client = new ExampleApi();

  it('promise methods', () => {
    METHODS.forEach((method) => {
      it(`#${method}#then should resolve`,
        () => client.hello[method]()
          .then((response) => {
            expect(response.body).to.equal('Hello World!');
            expect(response.status).to.equal(200);
            expect(typeof response.headers === 'object').to.equal(true);
          }));
    });
  });

  describe('reuse request', () => {
    it('should reuse the promise', () => {
      const request = client.hello.get();

      return request.then((response) => request.then((response2) => {
        expect(response).to.equal(response2);
      }));
    });
  });

  it('Promise#all should resolve', () => Promise
    .all([
      client.hello.get(),
      client.hello.post()
    ])
    .then((responses) => {
      const get = responses[0];
      const post = responses[1];

      expect(get.body).to.equal('Hello World!');
      expect(get.status).to.equal(200);
      expect(typeof get.headers === 'object').to.equal(true);

      expect(post.body).to.equal('Hello World!');
      expect(post.status).to.equal(200);
      expect(typeof post.headers === 'object').to.equal(true);
    }));
});
