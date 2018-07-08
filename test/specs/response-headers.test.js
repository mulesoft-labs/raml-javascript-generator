const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

describe('response headers', () => {
  const client = new ExampleApi();

  it('should return in a lower-cased object',
    () => client.get().then((res) => {
      expect(res.body).to.equal('Success');
      expect(res.status).to.equal(200);
      expect(res.headers['content-type']).to.equal('text/html; charset=utf-8');
    }));
});
