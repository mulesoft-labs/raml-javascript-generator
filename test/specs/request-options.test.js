const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

describe('set request options', () => {
  const defaultOptions = {
    baseUri: 'http://localhost:{port}',
    baseUriParameters: {
      port: 4567
    },
    headers: {}
  };

  describe('when the options are undefined', () => {
    it('then the options should be equal to the default request options', () => {
      const client = new ExampleApi();
      expect(client.options).to.deep.equal(defaultOptions);
    });
  });

  describe('when the options are void', () => {
    it('then the options should be equal to the default request options', () => {
      const client = new ExampleApi({});
      expect(client.options).to.deep.equal(defaultOptions);
    });
  });

  describe('when the options contain the headers', () => {
    it('then the header should be in the options', () => {
      const authorizationHeader = {
        headers: {
          Authorization: 'bearer awe23ezz123'
        }
      };
      const expectedOptions = {
        baseUri: 'http://localhost:{port}',
        baseUriParameters: {
          port: 4567
        },
        headers: {
          Authorization: 'bearer awe23ezz123'
        }
      };
      const client = new ExampleApi(authorizationHeader);
      expect(client.options).to.deep.equal(expectedOptions);
    });
  });

  describe('when set the headers', () => {
    it('then the headers should be in the options', () => {
      const client = new ExampleApi(defaultOptions);
      const headers = {
        Authorization: 'bearer awe23ezz124'
      };

      client.setHeaders(headers);
      expect(client.options.headers).to.deep.equal(headers);
    });
  });

  describe('when update the headers', () => {
    it('then the headers should be updated', () => {
      const options = {
        baseUri: 'http://localhost:{port}',
        baseUriParameters: {
          port: 4567
        },
        headers: {
          Authorization: 'bearer firstAuthorizationValue'
        }
      };

      const client = new ExampleApi(options);
      const updateHeader = {
        Authorization: 'bearer secondAuthorizationValue'
      };

      client.setHeaders(updateHeader);
      expect(client.options.headers).to.deep.equal(updateHeader);
    });
  });

  describe('when adds two items to the header', () => {
    it('then the headers should be in the options', () => {
      const options = {
        baseUri: 'http://localhost:{port}',
        baseUriParameters: {
          port: 4567
        },
        headers: {
          Authorization: 'bearer awe23ezz1257'
        }
      };

      const client = new ExampleApi(options);
      const updateHeaders = {
        'User-Agent': 'Mozilla',
        'Content-Type': 'application/json'
      };
      client.setHeaders(updateHeaders);
      expect(client.options.headers).to.deep.equal(updateHeaders);
    });
  });
});
