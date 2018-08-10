'use strict'

const notRHL = module.filename.indexOf('react-hot-loader') === -1
if ((!module.hot && notRHL) || process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/react-hot-loader.production.min.js');
} else {
  module.exports = require('./dist/react-hot-loader.development.js');
}
