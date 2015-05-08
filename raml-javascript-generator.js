var join = require('path').join
var readFileSync = require('fs').readFileSync
var generator = require('raml-generator')

function read (path) {
  return readFileSync(join(__dirname, 'lib', path), 'utf8')
}

module.exports = generator({
  templates: {
    '.gitignore': read('templates/.gitignore.hbs'),
    'index.js': read('templates/index.js.hbs'),
    'README.md': read('templates/README.md.hbs'),
    'INSTALL.md': read('templates/INSTALL.md.hbs'),
    'package.json': read('templates/package.json.hbs')
  },
  partials: {
    auth: read('partials/auth.js.hbs'),
    utils: read('partials/utils.js.hbs'),
    client: read('partials/client.js.hbs'),
    resources: read('partials/resources.js.hbs')
  },
  helpers: {
    stringify: require('javascript-stringify'),
    dependencies: require('./lib/helpers/dependencies'),
    requestSnippet: require('./lib/helpers/request-snippet'),
    parametersSnippet: require('./lib/helpers/parameters-snippet')
  }
})
