var path = require('path')
var fs = require('fs')
var generator = require('raml-generator')

module.exports = generator({
  templates: {
    '.gitignore': fs.readFileSync(path.join(__dirname, 'lib/templates/.gitignore.hbs'), 'utf8'),
    'index.js': fs.readFileSync(path.join(__dirname, 'lib/templates/index.js.hbs'), 'utf8'),
    'README.md': fs.readFileSync(path.join(__dirname, 'lib/templates/README.md.hbs'), 'utf8'),
    'INSTALL.md': fs.readFileSync(path.join(__dirname, 'lib/templates/INSTALL.md.hbs'), 'utf8'),
    'package.json': fs.readFileSync(path.join(__dirname, 'lib/templates/package.json.hbs'), 'utf8')
  },
  partials: {
    auth: fs.readFileSync(path.join(__dirname, 'lib/partials/auth.js.hbs'), 'utf8'),
    utils: fs.readFileSync(path.join(__dirname, 'lib/partials/utils.js.hbs'), 'utf8'),
    client: fs.readFileSync(path.join(__dirname, 'lib/partials/client.js.hbs'), 'utf8'),
    resources: fs.readFileSync(path.join(__dirname, 'lib/partials/resources.js.hbs'), 'utf8')
  },
  helpers: {
    stringify: require('javascript-stringify'),
    dependencies: require('./lib/helpers/dependencies'),
    requestSnippet: require('./lib/helpers/request-snippet'),
    parametersSnippet: require('./lib/helpers/parameters-snippet')
  }
})
