/* eslint-disable global-require */

if (!module.hot || process.env.NODE_ENV === 'production') {
  module.exports = require('./HotContainer.prod')
} else {
  module.exports = require('./HotContainer.dev')
}
