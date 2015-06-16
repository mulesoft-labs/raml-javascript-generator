var join = require('path').join
var readFileSync = require('fs').readFileSync
var generator = require('raml-generator')

module.exports = generator({
  templates: {
    '.gitignore': readFileSync(join(__dirname, 'lib/templates/.gitignore.hbs'), 'utf8'),
    'index.js': readFileSync(join(__dirname, 'lib/templates/index.js.hbs'), 'utf8'),
    'README.md': readFileSync(join(__dirname, 'lib/templates/README.md.hbs'), 'utf8'),
    'INSTALL.md': readFileSync(join(__dirname, 'lib/templates/INSTALL.md.hbs'), 'utf8'),
    'package.json': readFileSync(join(__dirname, 'lib/templates/package.json.hbs'), 'utf8')
  },
  partials: {
    auth: readFileSync(join(__dirname, 'lib/partials/auth.js.hbs'), 'utf8'),
    utils: readFileSync(join(__dirname, 'lib/partials/utils.js.hbs'), 'utf8'),
    client: readFileSync(join(__dirname, 'lib/partials/client.js.hbs'), 'utf8'),
    resources: readFileSync(join(__dirname, 'lib/partials/resources.js.hbs'), 'utf8')
  },
  helpers: {
    stringify: require('javascript-stringify'),
    dependencies: require('./lib/helpers/dependencies'),
    requestSnippet: require('./lib/helpers/request-snippet'),
    parametersSnippet: require('./lib/helpers/parameters-snippet')
  }
})
