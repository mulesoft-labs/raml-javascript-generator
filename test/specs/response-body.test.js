const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

describe('response body', () => {
  const client = new ExampleApi();

  describe('response content types', () => {
    describe('text', () => {
      it('should respond as text when unknown', () =>
        client.responses.text.get()
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body).to.equal('text');
          }));
    });

    describe('json', () => {
      it('should parse as JSON when specified', () =>
        client.responses.json.get()
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({ json: true });
          }));
    });
  });
});
