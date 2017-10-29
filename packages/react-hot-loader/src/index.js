/* eslint-disable global-require, import/no-mutable-exports */

let exportedModule

if (!module.hot || process.env.NODE_ENV === 'production') {
  exportedModule = require('./index.prod').default
} else {
  exportedModule = require('./index.dev').default
}

export default exportedModule
