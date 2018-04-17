const { expect } = require('chai');
const ExampleApi = require('../.tmp/example'); // eslint-disable-line import/no-unresolved

function TestClass() {
  this.test = 'ThisIsATest';
  this.getMessage = () => this.test;
}

const client = new ExampleApi();

describe('Extensibility Points', () => {
  it('Hook Extensibility Point Within a Class', () => {
    client.use('classSample', TestClass);

    expect(client.classSample.getMessage()).to.equal('ThisIsATest');
  });

  it('Hook Extensibility Point Within an Object', () => {
    client.use('objectExtension', { helloWorld() { return 'hello world'; } });
    expect(client.objectExtension.helloWorld()).to.equal('hello world');
  });

  it('Cannot overwrite existings properties', () => {
    const clientFunction = () => client.use('objectExtension', { helloWorld() { return 'hello world'; } });
    expect(clientFunction).to.throw();
  });

  it('Wrong parameters', () => {
    const clientFunction = () => client.use({ helloWorld() { return 'hello world'; } });
    expect(clientFunction).to.throw();
  });

  if (typeof window === 'undefined') {
    it('Hook Extensibility Point Within a NPM Module', () => {
      client.use('npmModuleWithName', 'methods');
      expect(client.npmModuleWithName.constructor === Array).to.equal(true);
    });

    it('Hook Extensibility Point Within a NPM Module without a name', () => {
      client.use('methods');
      expect(client.methods.constructor === Array).to.equal(true);
    });
  }
});
