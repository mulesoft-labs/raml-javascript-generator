import { Api } from 'raml-generator';
import paramCase = require('param-case');
import pascalCase = require('pascal-case');
import camelCase = require('camel-case');
import { Strands } from 'strands';

import { hasSecurity, allResources, getSecuritySchemes } from '../support/api';
import { getUriParametersSnippet } from '../support/resource';
import { getRequestSnippet, getDisplayName } from '../support/method';

export const readmeTemplate = (api: Api) => {
  const s = new Strands();
  const projectName = paramCase(api.title);
  const className = pascalCase(api.title);

  /* tslint:disable max-line-length ter-max-len */
  s.multiline(`# ${api.title}

> Browser and node module for making API requests against [${api.title}](${api.baseUri}).

## Installation

\`\`\`sh
npm install ${projectName} --save
\`\`\`

## Usage

\`\`\`js
var ${className} = require('${projectName}')

var client = new ${className}()
\`\`\`
`);

  if (hasSecurity(api, 'OAuth 2.0')) {
    s.multiline(`### Authentication

#### OAuth 2.0

This API supports authentication with [OAuth 2.0](https://github.com/mulesoft/js-client-oauth2). Initialize the \`OAuth2\` instance with the application client id, client secret and a redirect uri to authenticate with users.

\`\`\`js
var auth = new ${className}.security.<method>({
  clientId:     '123',
  clientSecret: 'abc',
  redirectUri:  'http://example.com/auth/callback'
});

// Available methods for OAuth 2.0:`);

    for (const scheme of getSecuritySchemes(api)) {
      if (scheme.type === 'OAuth 2.0') {
        s.line(` - ${camelCase(scheme.name)}`);
      }
    }

    s.line('```');
  }

  s.multiline(`### Options

You can set options when you initialize a client or at any time with the \`options\` property. You may also override options per request by passing an object as the last argument of request methods. For example:

\`\`\`javascript
var client = new ${className}({ ... })

client('GET', '/', {
  baseUri: 'http://example.com',
  headers: {
    'Content-Type': 'application/json'
  }
})
\`\`\`

#### Base URI

You can override the base URI by setting the \`baseUri\` property, or initializing a client with a base URI. For example:

\`\`\`javascript
new ${className}({
  baseUri: 'https://example.com'
});
\`\`\`

### Helpers

Exports \`${className}.form\`, which exposes a cross-platform \`FormData\` interface that can be used with request bodies.

### Methods

All methods return a HTTP request instance of [Popsicle](https://github.com/blakeembrey/popsicle), which allows the use of promises (and streaming in node).
`);

  for (const resource of allResources(api)) {
    for (const method of resource.methods) {
      s.line(`#### ${getDisplayName(method, resource)}`);
      s.line();

      if (Object.keys(resource.uriParameters).length) {
        s.line(getUriParametersSnippet(resource));
        s.line();
      }

      if (method.description) {
        s.multiline(method.description.trim());
        s.line();
      }

      s.multiline(`\`\`\`js
client.${getRequestSnippet(method, resource)}.then(...)
\`\`\`
  `);
  /* tslint:enable max-line-length */
    }
  }

  s.line('## License');
  s.line();
  s.line('Apache 2.0');

  return s.toString();
};
