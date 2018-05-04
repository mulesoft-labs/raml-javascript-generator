import uniqueid = require('uniqueid');

import { getUsedUriParameters, toMethodName } from './resource';

export interface KeyedNestedResources {
  [key: string]: NestedResource;
}

export interface SplitedKeyedNestedResources {
  withParams: KeyedNestedResources;
  noParams: KeyedNestedResources;
}

export interface AllResource {
  methods: any[];
  relativeUri: string;
  uriParameters: any;
  description: string;
}

export interface NestedResource {
  id: string;
  methodName: string;
  methods: NestedMethod[];
  relativeUri: string;
  uriParameters: any;
  children: {
    [path: string]: NestedResource
  };
}

export interface NestedMethod {
  id: string;
  method: string;
  headers: any;
}

/**
 * Check for existence of a security scheme type.
 */
export function hasSecurity(api: any, type: string) {
  if (api.securitySchemes) {
    return api.securitySchemes.some((schemes: any) => {
      for (const key of Object.keys(schemes)) {
        if (schemes[key].type === type) {
          return true;
        }
      }
      return false;
    });
  }
  return false;

}

/**
 * Flatten the broken nested security scheme array.
 */
export function getSecuritySchemes(api: any): any[] {
  const schemes: any[] = [];

  if (api.securitySchemes) {
    for (const nested of api.securitySchemes) {
      for (const key of Object.keys(nested)) {
        schemes.push(nested[key]);
      }
    }
  }

  return schemes;
}

/**
 * Retrieve all resources as an array.
 */
export function allResources(api: any): AllResource[] {
  const array: AllResource[] = [];

  // Recursively push all resources into a single flattened array.
  function recurse(resources: any[], prevUri: string, prevUriParams: any) {
    for (const resource of resources) {
      const relativeUri = prevUri + resource.relativeUri;
      const uriParameters = getUsedUriParameters(relativeUri, Object.assign({}, resource.uriParameters, prevUriParams));
      const methods = resource.methods ? resource.methods : [];
      const { description } = resource;

      array.push({ methods, relativeUri, uriParameters, description });

      if (resource.resources) {
        recurse(resource.resources, relativeUri, uriParameters);
      }
    }
  }

  recurse(api.resources, '', {});

  return array;
}

/**
 * Generate a normalized and nested tree of resources.
 */
export function nestedResources(api: any): NestedResource {
  const methodId = uniqueid('Method');
  const resourceId = uniqueid('Resource');

  const resource: NestedResource = {
    id: resourceId(),
    methodName: undefined,
    methods: [],
    relativeUri: '/',
    uriParameters: {},
    children: {}
  };

  function makeResource(node: NestedResource, child: any, segments: string[]): NestedResource {
    if (segments.length === 0) {
      if (child.methods) {
        // Push existing methods onto the active segment.
        for (const method of child.methods) {
          node.methods.push({
            id: methodId(),
            method: method.method,
            headers: method.headers
          });
        }
      }

      return node;
    }

    // Use segments as the key.
    const key = segments[0];
    let childResource = key === '/' ? node : node.children[key];

    if (childResource == null) {
      childResource = node.children[key] = {
        id: resourceId(),
        methodName: toMethodName(key),
        children: {},
        methods: [],
        uriParameters: getUsedUriParameters(key, child.uriParameters),
        relativeUri: key
      };
    }

    return makeResource(childResource, child, segments.slice(1));
  }

  function handle(resource: NestedResource, children: any[]) {
    for (const child of children) {
      const segments = child.relativeUri.split(/(?=[\/\.])/g);
      const childResource = makeResource(resource, child, segments);

      if (child.resources) {
        handle(childResource, child.resources);
      }
    }
  }

  handle(resource, api.resources);

  return resource;
}

export function separateChildren(resource: NestedResource): SplitedKeyedNestedResources {
  const withParams: KeyedNestedResources = {};
  const noParams: KeyedNestedResources = {};

  // Split apart children types.
  for (const key of Object.keys(resource.children)) {
    const child = resource.children[key];

    if (Object.keys(child.uriParameters).length) {
      withParams[child.methodName] = child;
    } else {
      noParams[child.methodName] = child;
    }
  }

  return { withParams, noParams };
}
