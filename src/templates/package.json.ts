import paramCase = require('param-case')
import { Api } from 'raml-generator'

import { hasSecurity } from '../support/api'

export default function (api: Api) {
  return JSON.stringify({
    name: paramCase(api.title),
    version: '0.0.0',
    description: api.description,
    main: 'index.js',
    files: [
      'index.js'
    ],
    repository: {
      type: 'git',
      url: 'git://github.com/mulesoft/raml-javascript-generator.git'
    },
    keywords: [
      'raml-api'
    ],
    author: 'MuleSoft, Inc.',
    license: 'Apache-2.0',
    bugs: {
      url: 'https://github.com/mulesoft/raml-javascript-generator/issues'
    },
    homepage: 'https://github.com/mulesoft/raml-javascript-generator',
    dependencies: {
      'client-oauth2': hasSecurity(api, 'OAuth 2.0') ? '^2.1.0' : undefined,
      'xtend': '^4.0.1',
      'setprototypeof': '^1.0.1'
    }
  }, null, 2) + '\n'
}
