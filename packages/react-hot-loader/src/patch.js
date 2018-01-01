/* eslint-disable global-require, import/no-mutable-exports */

if (!module.hot || process.env.NODE_ENV === 'production') {
  module.exports = require('./prod/patch.prod')
} else {
  module.exports = require('./patch.dev')
}
