import { Strands } from 'strands';
import { Api } from 'raml-generator';
import camelCase = require('camel-case');
import uppercamelcase = require('uppercamelcase');
import javascriptStringify = require('javascript-stringify');
import { getDefaultParameters } from '../support/parameters';

import {
  hasSecurity,
  getSecuritySchemes,
  allResources,
  nestedResources,
  separateChildren,
  NestedMethod,
  NestedResource,
  KeyedNestedResources,
  SplitedKeyedNestedResources,
  AllResource
} from '../support/api';
import { isQueryMethod } from '../support/method';

export const indexTemplate = (api: Api): string => {
  const tplGenerator = new ClientTemplateGenerator(api);
  return tplGenerator.getClient();
};

class ClientTemplateGenerator {
  private api: Api;
  private currentPath: string[];
  private classes: string[];
  private buffer: Strands;
  private flatTree: AllResource[];
  private nestedTree: NestedResource;
  private withParams: KeyedNestedResources;
  private noParams: KeyedNestedResources;
  private supportedSecuritySchemes: any[];

  constructor(api: Api) {
    this.classes = [];
    this.api = api;
    this.flatTree = allResources(api);
    this.nestedTree = nestedResources(api);
    const splitedNestedResources: SplitedKeyedNestedResources = separateChildren(this.nestedTree);
    this.withParams = splitedNestedResources.withParams;
    this.noParams = splitedNestedResources.noParams;
    this.supportedSecuritySchemes = getSecuritySchemes(api).filter(x => x.type === 'OAuth 2.0');
    this.currentPath = [];
    this.buffer = new Strands();
  }

  public getClient() {
    this.generateRequiresAndGlobalFunctions();
    this.createClientClass();
    this.createChildren();
    this.generateStaticMethodsAndExport();
    return this.buffer.toString();
  }

  private generateRequiresAndGlobalFunctions() {
    this.buffer.line(`/* eslint no-use-before-define: 0 */`);

    if (hasSecurity(this.api, 'OAuth 2.0')) {
      this.buffer.line(`const ClientOAuth2 = require('client-oauth2');`);
    }

    this.buffer.multiline(`const rp = require('request-promise');
const queryString = require('query-string');
const debuglog = require('util').debuglog('${this.api.title}');

const TEMPLATE_REGEXP = /\{\\+?([^\{\}]+)\}/g;

const template = (string, interpolate) => string.replace(TEMPLATE_REGEXP, (match, key) => {
  if (interpolate[key] != null) {
    return encodeURIComponent(interpolate[key]);
  }

  return '';
});

const request = (client, method, path, opts) => {
  const headers = opts.headers ? Object.assign(
    {}, client.options.headers, opts.headers
  ) : client.options.headers;
  const options = Object.assign({}, client.options, opts);
  const baseUri = template(options.baseUri, options.baseUriParameters);

  if (typeof options.query === 'string') {
    options.query = queryString.parse(options.query);
  }

  let reqOpts = {
    url: baseUri.replace(/\\/$/, '') + template(path, options.uriParameters),
    json: !Buffer.isBuffer(options.body),
    method,
    headers,
    formData: options.formData,
    body: options.body,
    qs: options.query,
    options: options.options,
    resolveWithFullResponse: true
  };

  if (options.options !== undefined) {
    reqOpts = Object.assign(reqOpts, options.options);
  }

  if (options.user && typeof options.user.sign === 'function') {
    reqOpts = options.user.sign(reqOpts);
  }

  debuglog(\`[REQUEST]: \${JSON.stringify(reqOpts, null, 2)}\`);

  return rp(reqOpts)
    .then((response) => {
      const responseLog = {
        headers: response.headers,
        body: response.body,
        statusCode: response.statusCode
      };
      debuglog(\`[RESPONSE]: \${JSON.stringify(responseLog, null, 2)}\`);

      // adding backward compatibility
      response.status = response.statusCode;
      return response;
    })
    .catch((error) => {
      debuglog(\`[RESPONSE]: \${JSON.stringify(error, null, 2)}\`);

      // rethrow the error so that the returned promise is rejected
      throw error;
    });
};`);
  }

  private toParamsFunction(child: NestedResource, client: string, isChild: boolean, attach?: string) {
    const className = `${this.currentPath.join('.')}.${uppercamelcase(child.methodName)}`;
    const func2Return = new Strands();
    const path = isChild ? 'this.path + ' : '';
    func2Return.multiline(`(uriParams) => new ${className}(
      ${client},
      ${path}template(${javascriptStringify(child.relativeUri)},
        Object.assign(${javascriptStringify(getDefaultParameters(child.uriParameters))}, uriParams))
    ),${attach}`);
    return func2Return.toString();
  }

  private toParamsMethod(child: NestedResource, client: string, isChild: boolean) {
    const className = this.currentPath.concat([uppercamelcase(child.methodName)]).join('.');
    const func2Return = new Strands();
    const path = isChild ? 'this.path + ' : '';

    func2Return.multiline(`(uriParams) {
    return new ${className}(
      ${client},
      ${path}template(${javascriptStringify(child.relativeUri)},
        Object.assign(${this.formatJSON(getDefaultParameters(child.uriParameters), 2, 8)}, uriParams))
    );
  }`);
    return func2Return.toString();
  }

  // Create prototype methods.
  private createProtoMethods(methods: NestedMethod[], client: string, path: string, prefix?: string) {
    for (const method of methods) {
      const headers = getDefaultParameters(method.headers);
      const type = isQueryMethod(method) ? 'query' : 'body';
      const headersText = Object.keys(headers).length === 0 ? '' : `,\n    {\n      headers: ${this.formatJSON(headers, 2, 6)}\n    }`;

      if (prefix) {
        this.buffer.line(`${prefix}.prototype.${camelCase(method.method)} = function ${camelCase(method.method)}Func(${type}, opts) {`);
        this.buffer.line(`  const options = Object.assign(${type} && ${type}.formData ? ${type} : {`);
        this.buffer.line(`    ${type}`);
        this.buffer.line(`  }${headersText}, opts);`);
        this.buffer.line(`  return request(${client}, ${javascriptStringify(method.method)}, ${path}, options);`);
        this.buffer.line(`};`);
      } else {
        this.buffer.line();
        this.buffer.line(`  ${camelCase(method.method)}(${type}, opts) {`);
        this.buffer.line(`    const options = Object.assign(${type} && ${type}.formData ? ${type} : {`);
        this.buffer.line(`      ${type}`);
        this.buffer.line(`    }${headersText}, opts);`);
        this.buffer.line(`    return request(${client}, ${javascriptStringify(method.method)}, ${path}, options);`);
        this.buffer.line(`  }`);
      }
    }
  }

  // Create prototype resources.
  private createProtoResources(withParams: KeyedNestedResources, client: string, noParams: KeyedNestedResources) {
    for (const key of Object.keys(withParams)) {
      const child = withParams[key];

      // Skip inlined entries.
      if (noParams[key] != null) {
        continue;
      }

      this.buffer.append(`\n`);
      this.buffer.append(`  ${child.methodName}${this.toParamsMethod(child, client, true)}`);
    }
  }

  // Create nested resource instances.
  private createResource(resource: NestedResource) {
    this.currentPath.push(uppercamelcase(resource.methodName));
    const { withParams, noParams } = separateChildren(resource);
    const className = this.currentPath.join('.');

    this.buffer.return();
    // Check if this class is already there
    if (this.classes.filter(x => x === className).length > 0) {
      this.createProtoMethods(resource.methods, 'this.client', 'this.path', className);
    } else {
      this.classes.push(className);
      if (className.indexOf('.') > 0) {
        this.buffer.line(`${className} = class {`);
      } else {
        this.buffer.line(`class ${className} {`);
      }
      this.buffer.line(`  constructor(client, path) {`);
      this.buffer.line(`    this.client = client;`);
      this.buffer.line(`    this.path = path;`);

      this.createThisResources(withParams, noParams, 'this.client');
      this.buffer.line(`  }`);
      this.createProtoResources(withParams, 'this.client', noParams);
      this.createProtoMethods(resource.methods, 'this.client', 'this.path');
      if (className.indexOf('.') > 0) {
        this.buffer.line(`};`);
      } else {
        this.buffer.line(`}`);
      }
      this.createChildren(resource.children);
    }
    this.currentPath.pop();

  }

  // Generate all children.
  private createChildren(children?: KeyedNestedResources) {
    const childrenToUse = children || this.nestedTree.children;
    for (const key of Object.keys(childrenToUse)) {
      this.createResource(childrenToUse[key]);
    }
  }

  private createThisResources(withParams: KeyedNestedResources, noParams: KeyedNestedResources, client: string, isChild = true) {
    for (const key of Object.keys(noParams)) {
      const child = noParams[key];
      let constructor;
      let path: string;
      if (isChild) {
        path = `\`\${this.path}${child.relativeUri}\``;
      } else {
        path = `'${child.relativeUri}'`;
      }
      if (this.currentPath.length === 0) {
        constructor = `new ${uppercamelcase(child.methodName)}(${client}, ${path})`;
      } else {
        constructor = `new ${this.currentPath.join('.')}.` +
          `${uppercamelcase(child.methodName)}(${client}, ${path})`;
      }

      if (withParams[key] == null) {
        this.buffer.line(`    this.${child.methodName} = ${constructor};`);
      } else {
        this.buffer.line();
        this.buffer.append(`    this.${child.methodName} = Object.setPrototypeOf(` +
          `${this.toParamsFunction(withParams[key], client, isChild, ` ${constructor});`)}`);
      }
    }
  }

  private createClientClass() {
    this.buffer.multiline(`
class Client {
  constructor(options) {
    this.path = '';
    this.options = Object.assign({
      baseUri: ${javascriptStringify(this.api.baseUri)},
      baseUriParameters: ${this.formatJSON(getDefaultParameters(this.api.baseUriParameters), 2, 6).split('\n').join('\n') },
      headers: {}
    }, options);
    this.customRequest = (method, path, opts) => request(
      this, method, path, opts
    );\n
    this.form = (payload) => {
      const data = {
        formData: payload,
        append(key, value) {
          if (typeof value !== 'string') {
            this.formData.file = value;
          } else {
            data.formData[key] = value;
          }
        }
      };
      return data;
    };\n`);

    this.createThisResources(this.withParams, this.noParams, 'this', false);

    this.buffer.line(`  }\n`);
    // Adding the extensibility point

    this.buffer.multiline(`  setHeaders(headers) {
    this.options.headers = headers;`);
    this.buffer.line(`  }`);

    this.buffer.multiline(`
  use(name, module) {
    const moduleType = typeof module;
    if (Object.prototype.hasOwnProperty.call(this, name)) {
      throw Error(\`The property \${name} already exists\`);
    }
    switch (moduleType) {
      case 'string':
        // eslint-disable-next-line
        this[name] = require(module);
        break;
      case 'function':
        this[name] = new module(); // eslint-disable-line new-cap
        break;
      case 'object':
        this[name] = module;
        break;
      case 'undefined':
        if (typeof name === 'string') {
          // eslint-disable-next-line
          this[name] = require(name);
          break;
        }
        throw Error('Cannot create the extension point with the values provided');
      default:
        throw Error('Cannot create the extension point with the values provided');
    }
  }`);
    for (const resource of this.flatTree) {
      const { relativeUri, uriParameters } = resource;

      for (const method of resource.methods) {
        if (method.annotations && method.annotations['client.methodName']) {
          const methodName = method.annotations['client.methodName'].structuredValue;
          const type = isQueryMethod(method) ? 'query' : 'body';
          const headers = getDefaultParameters(method.headers);

          const headersText = Object.keys(headers).length === 0 ? '' : `, headers: ${javascriptStringify(headers)}`;

          if (Object.keys(uriParameters).length) {
            this.buffer.return();
            this.buffer.line(`  ${methodName}(uriParams, ${type}, opts) {`);
            this.buffer.line(`    const uriParameters = Object.assign(` +
              `${javascriptStringify(getDefaultParameters(uriParameters))}, uriParams);`);
            this.buffer.line(`  const options = Object.assign({ ${type}, ` +
              `uriParameters: uriParameters${headersText} }, opts);`);
            this.buffer.line(`  return request(this, ${javascriptStringify(method.method)}, ` +
              `${javascriptStringify(relativeUri)}, options);`);
            this.buffer.line(`  }`);
          } else {
            this.buffer.return();
            this.buffer.line(`  ${methodName}(${type}, opts) {`);
            this.buffer.line(`    const options = Object.assign({ ${type}${headersText} }, opts);`);
            this.buffer.line(`    return request(this, ${javascriptStringify(method.method)}, ` +
              `${javascriptStringify(relativeUri)}, options);`);
            this.buffer.line(`  }`);
          }
        }
      }
    }
    this.createProtoMethods(this.nestedTree.methods, 'this', `''`);
    this.createProtoResources(this.withParams, 'this', this.noParams);
    this.buffer.line(`}`);
  }

  private generateStaticMethodsAndExport() {
    this.buffer.line(`Client.version = ${javascriptStringify(this.api.version)};`);
    this.buffer.line('Client.Security = {');

    this.supportedSecuritySchemes.forEach((scheme: any, index: number, schemes: any[]) => {
      const name = camelCase(scheme.name);
      const trailing = index < schemes.length - 1 ? ',' : '';

      if (scheme.type === 'OAuth 2.0') {
        this.buffer.return();
        this.buffer.line('  // eslint-disable-next-line');
        this.buffer.line(`  ${name}: function ${name}(options) {`);
        this.buffer.multiline(`    const schemeSettings = ${this.formatJSON(scheme.settings, 2, 4)};`);
        this.buffer.line(`    return new ClientOAuth2(Object.assign(schemeSettings, options));`);
        this.buffer.line(`  }${trailing}`);
      }
    });
    this.buffer.line('};');
    this.buffer.line(`module.exports = Client;`);
  }

  private formatJSON(object: any, jsonIndent: number, srcIndent: number) {
    let spaces = '';
    for (let x = 0; x < srcIndent; x = x + 1) {
      spaces += ' ';
    }
    return javascriptStringify(object, null, jsonIndent).split('\n').join(`\n${spaces}`);
  }

}
