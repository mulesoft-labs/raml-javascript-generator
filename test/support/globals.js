if (typeof window !== 'undefined') {
  window.ES6Promise.polyfill()
} else {
  require('es6-promise').polyfill()
}
