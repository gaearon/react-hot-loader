/* eslint-disable global-require, import/no-mutable-exports, no-var */

if (!module.hot || process.env.NODE_ENV === 'production') {
  module.exports = require('./prod/index.prod')
} else {
  module.exports = require('./index.dev')
}
