const methods = process.browser ? ['get', 'post', 'put', 'patch', 'delete'] : require('methods');
const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

describe('custom resource', () => {
  const client = new ExampleApi();

  methods.forEach((verb) => {
    if (verb === 'connect' || verb === 'head') {
      return;
    }

    it(`method ${verb} should work`,
      () => client.customRequest(verb, '/status/{id}', { uriParameters: { id: 200 } })
        .then((response) => {
          expect(response.body).to.equal('Success');
          expect(response.status).to.equal(200);
        }));
  });
});
