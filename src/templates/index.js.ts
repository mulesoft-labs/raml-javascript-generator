import { Strands } from 'strands'
import { Api } from 'raml-generator'
import pascalCase = require('pascal-case')
import camelCase = require('camel-case')
import stringify = require('javascript-stringify')

import { getDefaultParameters } from '../support/parameters'
import { hasSecurity, getSecuritySchemes, allResources, nestedResources, NestedMethod, NestedResource } from '../support/api'
import { isQueryMethod } from '../support/method'

export default function (api: Api): string {
  const s = new Strands()
  const flatTree = allResources(api) // For short-hand annotations.
  const nestedTree = nestedResources(api)
  const { withParams, noParams } = separateChildren(nestedTree)
  const supportedSecuritySchemes = getSecuritySchemes(api).filter(x => x.type === 'OAuth 2.0')

  if (hasSecurity(api, 'OAuth 2.0')) {
    s.line(`var ClientOAuth2 = require('client-oauth2')`)
  }

  s.multiline(`var popsicle = require('popsicle')
var extend = require('xtend')
var setprototypeof = require('setprototypeof')

var TEMPLATE_REGEXP = /\\{([^\\{\\}]+)\\}/g

module.exports = Client

function template (string, interpolate) {
  return string.replace(TEMPLATE_REGEXP, function (match, key) {
    if (interpolate[key] != null) {
      return encodeURIComponent(interpolate[key])
    }

    return ''
  })
}

function request (client, method, path, opts) {
  var options = extend({}, client._options, opts)
  var baseUri = template(options.baseUri, options.baseUriParameters)

  var reqOpts = {
    url: baseUri.replace(/\\/$/, '') + template(path, options.uriParameters),
    method: method,
    headers: options.headers,
    body: options.body,
    query: options.query,
    options: options.options
  }

  if (options.user && typeof options.user.sign === 'function') {
    reqOpts = options.user.sign(reqOpts)
  }

  return popsicle.request(reqOpts)
}

function Client (options) {
  this._path = ''
  this._options = extend({
    baseUri: ${stringify(api.baseUri)},
    baseUriParameters: ${stringify(getDefaultParameters(api.baseUriParameters)) }
  }, options)

  function client (method, path, options) {
    return request(client, method, path, options)
  }
`)

  createThisResources(withParams, noParams, 'client', '')

  s.line(`  setprototypeof(client, this)`)
  s.line(`  return client`)
  s.line(`}`)
  s.line()
  s.line(`Client.form = popsicle.form`)
  s.line(`Client.version = ${stringify(api.version)}`)

  s.line('Client.Security = {')

  supportedSecuritySchemes.forEach((scheme: any, index: number, schemes: any[]) => {
    const name = camelCase(scheme.name)
    const trailing = index < schemes.length ? ',' : ''

    if (scheme.type === 'OAuth 2.0') {
      s.line(`  ${name}: function (options) { return new ClientOAuth2(extend(${stringify(scheme.settings)}, options)) }${trailing}`)
    }
  })

  s.line('}')

  for (const resource of flatTree) {
    const { relativeUri, uriParameters } = resource

    for (const method of resource.methods) {
      if (method.annotations && method.annotations['client.methodName']) {
        const methodName = method.annotations['client.methodName'].structuredValue
        const type = isQueryMethod(method) ? 'query' : 'body'
        const headers = getDefaultParameters(method.headers)

        if (Object.keys(uriParameters).length) {
          s.line(`Client.prototype.${methodName} = function (uriParams, ${type}, opts) {`)
          s.line(`  var uriParameters = extend(${stringify(getDefaultParameters(uriParameters))}, uriParams)`)
          s.line(`  var options = extend({ ${type}: ${type}, uriParameters: uriParameters, headers: ${stringify(headers)} }, opts)`)
          s.line(`  return request(this, ${stringify(method.method)}, ${stringify(relativeUri)}, options)`)
          s.line(`}`)
        } else {
          s.line(`Client.prototype.${methodName} = function (${type}, opts) {`)
          s.line(`  var options = extend({ ${type}: ${type}, headers: ${stringify(headers)} }, opts)`)
          s.line(`  return request(this, ${stringify(method.method)}, ${stringify(relativeUri)}, options)`)
          s.line(`}`)
        }
      }
    }
  }

  createProtoResources(withParams, noParams, 'Client')
  createProtoMethods(nestedTree.methods, 'Client', 'this', `''`)
  createChildren(nestedTree.children)

  // Interface for mapped nested resources.
  interface KeyedNestedResources {
    [key: string]: NestedResource
  }

  // Create prototype methods.
  function createProtoMethods (methods: NestedMethod[], id: string, _client: string, _path: string) {
    for (const method of methods) {
      const headers = getDefaultParameters(method.headers)
      const type = isQueryMethod(method) ? 'query' : 'body'

      s.line(`${id}.prototype.${camelCase(method.method)} = function (${type}, opts) {`)
      s.line(`  var options = extend({ ${type}: ${type}, headers: ${stringify(headers)} }, opts)`)
      s.line(`  return request(${_client}, ${stringify(method.method)}, ${_path}, options)`)
      s.line(`}`)
    }
  }

  // Split children by "type" of method that needs to be created.
  function separateChildren (resource: NestedResource) {
    const withParams: KeyedNestedResources = {}
    const noParams: KeyedNestedResources = {}

    // Split apart children types.
    for (const key of Object.keys(resource.children)) {
      const child = resource.children[key]

      if (Object.keys(child.uriParameters).length) {
        withParams[child.methodName] = child
      } else {
        noParams[child.methodName] = child
      }
    }

    return { withParams, noParams }
  }

  function toParamsFunction (child: NestedResource, _client: string, _prefix: string) {
    return `function (uriParams) { return new ${child.id}(${_client}, ${_prefix}template(${stringify(child.relativeUri)}, extend(${stringify(getDefaultParameters(child.uriParameters))}, uriParams))) }`
  }

  // Create prototype resources.
  function createProtoResources (withParams: KeyedNestedResources, noParams: KeyedNestedResources, id: string) {
    for (const key of Object.keys(withParams)) {
      const child = withParams[key]

      // Skip inlined entries.
      if (noParams[key] != null) {
        continue
      }

      s.line(`${id}.prototype.${child.methodName} = ${toParamsFunction(child, 'this._client', 'this._path + ')}`)
    }
  }

  // Create nested resource instances.
  function createResource (resource: NestedResource) {
    const { withParams, noParams } = separateChildren(resource)

    s.line(`function ${resource.id} (client, path) {`)
    s.line(`  this._client = client`)
    s.line(`  this._path = path`)

    createThisResources(withParams, noParams, 'this._client', 'this._path + ')

    s.line(`}`)

    createProtoResources(withParams, noParams, resource.id)
    createProtoMethods(resource.methods, resource.id, 'this._client', 'this._path')
    createChildren(resource.children)
  }

  // Generate all children.
  function createChildren (children: KeyedNestedResources) {
    for (const key of Object.keys(children)) {
      createResource(children[key])
    }
  }

  function createThisResources (withParams: KeyedNestedResources, noParams: KeyedNestedResources, _client: string, _prefix: string) {
    for (const key of Object.keys(noParams)) {
      const child = noParams[key]
      const constructor = `new ${child.id}(${_client}, ${_prefix}${stringify(child.relativeUri)})`

      if (withParams[key] == null) {
        s.line(`  this.${child.methodName} = ${constructor}`)
      } else {
        s.line(`  this.${child.methodName} = setprototypeof(${toParamsFunction(withParams[key], _client, _prefix)}, ${constructor})`)
      }
    }
  }

  return s.toString()
}
