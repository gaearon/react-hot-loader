/* eslint-disable global-require */

if (!module.hot || process.env.NODE_ENV === 'production') {
  module.exports = require('./patch.prod')
} else {
  module.exports = require('./patch.dev')
}
