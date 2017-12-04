/* eslint-disable global-require, import/no-mutable-exports */

let exportedModule

if (!module.hot || process.env.NODE_ENV === 'production') {
  exportedModule = require('./index.prod')
} else {
  exportedModule = require('./index.dev')
}

module.exports = exportedModule
