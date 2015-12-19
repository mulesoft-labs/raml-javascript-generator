export function getDefaultParameters (parameters: any) {
  const defaults: any = {}

  if (parameters) {
    for (const key of Object.keys(parameters)) {
      const param = parameters[key]

      if (param && param.default) {
        defaults[key] = param.default
      }
    }
  }

  return defaults
}