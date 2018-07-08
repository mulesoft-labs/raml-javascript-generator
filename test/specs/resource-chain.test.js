const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

describe('resource chain', () => {
  const client = new ExampleApi();

  function validateResponse() {
    return (response) => {
      expect(response.body).to.equal('Success');
      expect(response.status).to.equal(200);
    };
  }

  it('root resource work', () => client.get().then(validateResponse()));

  describe('uri parameter', () => {
    it('dynamically generate the resource chain',
      () => client.bounce.parameter.variable({ variable: 123 }).get()
        .then((res) => {
          expect(res.body).to.equal(123);
          expect(res.status).to.equal(200);
        }));
  });

  describe('default uri parameter', () => {
    it('use the default value when null',
      () => client.defaults.parameter.variable(null).get()
        .then((res) => {
          expect(res.body).to.equal('default');
          expect(res.status).to.equal(200);
        }));
  });

  describe('prefixed uri parameter', () => {
    function verifyResponse() {
      return (res) => {
        expect(res.body).to.equal(123);
        expect(res.status).to.equal(200);
      };
    }

    it('single parameter', () => client.parameters.prefix.one({ id: 123 }).get()
      .then(verifyResponse()));

    it('multiple parameters',
      () => client.parameters.prefix.three({ a: 1, b: 2, c: 3 }).get()
        .then((res) => {
          expect(res.body).to.equal(123);
          expect(res.status).to.equal(200);
        }));
  });

  describe('extensions', () => {
    describe('static extension', () => {
      it('support extensions in the resource chain',
        () => client.extensions.static.json.get()
          .then(validateResponse()));
    });

    describe('media type extension', () => {
      describe('basic', () => {
        it('support mediaTypeExtension parameter',
          () => client.extensions.mediaType.basic({ mediaTypeExtension: '.json' }).get()
            .then(validateResponse()));
      });

      describe('enum', () => {
        it('have paths from enum values',
          () => client.extensions.mediaType.enum({ mediaTypeExtension: '.json' }).get().then(validateResponse()));
      });
    });
  });

  describe('conflicts', () => {
    describe('media type extension', () => {
      it('handle original route', () => client.conflicts.mediaType.route.get().then(validateResponse()));

      it('handle conflict with media type extension',
        () => client.conflicts.mediaType({ mediaTypeExtension: '.json' }).get().then(validateResponse()));
    });
  });
});
