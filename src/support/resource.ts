import camelCase = require('camel-case');
import javascriptStringify = require('javascript-stringify');

const TEMPLATE_REGEXP = /\{\+?(\w+)\}/g;

/**
 * Return a snippet with URI parameter types.
 */
export function getUriParametersSnippet(resource: any) {
  const uriParams = getUsedUriParameters(resource.relativeUri, resource.uriParameters);

  return Object.keys(uriParams).map((key) => {
    const param = uriParams[key];
    const options: string[] = [];

    if (param.type) {
      options.push(`type: \`${param.type}\``);
    }

    if (Array.isArray(param.enum) && param.enum.length) {
      options.push(`one of (${param.enum.join(', ')})`);
    }

    if (param.default) {
      options.push(`default: \`${javascriptStringify(param.default)}\``);
    }

    return `* **${key}**${param.description ? ` ${param.description.trim()}` : ''} (${options.join(', ')})`;
  }).join('\n');
}

/**
 * Extract the used URI parameters.
 */
export function getUsedUriParameters(uri: string, uriParameters: any) {
  const params: any = {};
  let match: any;

  while (match = TEMPLATE_REGEXP.exec(uri)) {
    const [, key] = match;

    params[key] = uriParameters[key] || { type: 'string', required: true };
  }

  return params;
}

/**
 * Stringify the uri to a method name.
 */
export function toMethodName(uri: string) {
  // Only param. E.g. "/{param}".
  if (/^[\.\/]\{[^\{\}]+\}$/.test(uri)) {
    return camelCase(uri.slice(2, -1));
  }

  // Static text with trailing params. E.g. "/string{id}".
  if (/^[\.\/][^\{\}]+(?:\{[^\{\}]+\})*$/.test(uri)) {
    return camelCase(uri.replace(/\{.+\}$/, ''));
  }

  return camelCase(uri);
}
