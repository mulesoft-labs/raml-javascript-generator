const nock = require('nock');
const sinon = require('sinon');
const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

describe('base uri', () => {
  let server;

  function validateResponse() {
    return (response) => {
      expect(response.body).to.equal('Hello World!');
      expect(response.status).to.equal(200);
    };
  }

  if (process.browser) {
    it('before', (done) => {
      server = sinon.fakeServer.create();

      server.autoRespond = true;

      server.respondWith('GET', 'http://test.com/hello', 'Hello World!');
      server.respondWith('GET', 'http://google.com/search/hello', 'Hello World!');

      done();
    });
  } else {
    it('before', (done) => {
      nock.enableNetConnect('localhost');

      nock('http://google.com')
        .get('/search/hello')
        .reply(200, 'Hello World!');

      nock('http://test.com')
        .get('/hello')
        .reply(200, 'Hello World!');

      done();
    });
  }

  it('set base uri', () => {
    const client = new ExampleApi({
      baseUri: 'http://google.com/search/'
    });

    it('should be able to manually set the base uri',
      () => client.hello.get().then(validateResponse()));
  });

  it('base uri parameters', () => {
    const client = new ExampleApi({
      baseUri: 'http://{domain}.com',
      baseUriParameters: {
        domain: 'test'
      }
    });

    it('should be able to manually set the base uri',
      () => client.hello.get().then(validateResponse()));
  });

  if (process.browser) {
    it('after', () => {
      server.restore();
    });
  }
});
