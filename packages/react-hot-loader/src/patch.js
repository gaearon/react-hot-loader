/* eslint-disable global-require, import/no-mutable-exports */

let exportedModule

if (!module.hot || process.env.NODE_ENV === 'production') {
  exportedModule = require('./patch.prod').default
} else {
  exportedModule = require('./patch.dev').default
}

export default exportedModule
