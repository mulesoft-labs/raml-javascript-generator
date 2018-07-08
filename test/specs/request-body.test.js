const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

describe('request body', () => {
  const client = new ExampleApi();

  const REQUEST_BODY = {
    username: 'blakeembrey',
    password: 'hunter2'
  };

  function validateResponse() {
    return (response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(REQUEST_BODY);
    };
  }

  describe('basic request bodies', () => {
    describe('json', () => {
      it('should default to json', () => client.bounce.body.post(REQUEST_BODY).then(validateResponse()));

      it('should stringify as json when specified',
        () => client.bounce.body.post(REQUEST_BODY, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(validateResponse()));
    });

    describe('primitives', () => {
      describe('strings', () => {
        it('should send the body as set',
          () => client.bounce.body.post('test').then((response) => {
            expect(response.body).to.equal('test');
            expect(response.status).to.equal(200);
          }));
      });

      describe('numbers', () => {
        it('should send the body as a string',
          () => client.bounce.body.post(10).then((response) => {
            expect(response.body).to.equal(10);
            expect(response.status).to.equal(200);
          }));
      });

      describe('null', () => {
        it('should not send a body',
          () => client.bounce.body.post(null).then((response) => {
            expect(response.body).to.equal(null);
            expect(response.status).to.equal(200);
          }));
      });
    });
  });
});
