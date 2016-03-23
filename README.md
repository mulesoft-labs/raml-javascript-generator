# RAML JavaScript Generator

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Generate a JavaScript API client from RAML.

## Installation

```
npm install raml-javascript-generator -g
```

## Usage

This module depends on [raml-generator](https://github.com/mulesoft-labs/raml-generator) and can be used globally or locally with JavaScript.

* Chained DSL generation
* `README.md` output
* Support for `client.methodName` and `client.displayName` annotations
* Emits OAuth 2.0 client wrappers

### Global

```
raml-javascript-generator api.raml -o js-client
```

### Locally

```js
var jsGenerator = require('raml-javascript-generator')

var output = jsGenerator(/* api, data */)
```

## License

Apache License 2.0

[npm-image]: https://img.shields.io/npm/v/raml-javascript-generator.svg?style=flat
[npm-url]: https://npmjs.org/package/raml-javascript-generator
[downloads-image]: https://img.shields.io/npm/dm/raml-javascript-generator.svg?style=flat
[downloads-url]: https://npmjs.org/package/raml-javascript-generator
[travis-image]: https://img.shields.io/travis/mulesoft-labs/raml-javascript-generator.svg?style=flat
[travis-url]: https://travis-ci.org/mulesoft-labs/raml-javascript-generator
[coveralls-image]: https://img.shields.io/coveralls/mulesoft-labs/raml-javascript-generator.svg?style=flat
[coveralls-url]: https://coveralls.io/r/mulesoft-labs/raml-javascript-generator?branch=master
