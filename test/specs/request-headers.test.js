const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

describe('request headers', () => {
  const client = new ExampleApi();

  describe('custom headers', () => {
    it('should pass custom headers with the request', () => client.bounce.headers.get(null, {
      headers: { 'X-Custom-Header': 'Custom Header' }
    })
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body['x-custom-header']).to.equal('Custom Header');
      }));
  });

  describe('default headers', () => {
    describe('use defaults', () => {
      it('should use default headers from definition',
        () => client.defaults.headers.get().then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body['x-default-header']).to.equal('Hello World!');
        }));
    });

    describe('override defaults', () => {
      it('should override default headers',
        () => client.defaults.headers.get(null, {
          headers: { 'x-default-header': 'Overridden' }
        }).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body['x-default-header']).to.equal('Overridden');
        }));
    });
  });
});
