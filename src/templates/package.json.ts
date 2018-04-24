import paramCase = require('param-case');
import { Api } from 'raml-generator';

import { hasSecurity } from '../support/api';

export const packageTemplate = (api: Api) => {
  const json = {
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
      xtend: '^4.0.1',
      'request-promise': '^4.2.2',
      request: '^2.34',
      setprototypeof: '^1.0.1',
      'query-string': '^5.0.0'
    }
  };

  return JSON.stringify(json, null, 2) + '\n';
};
