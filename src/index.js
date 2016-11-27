/* eslint-disable global-require */

'use strict';

if (!module.hot || process.env.NODE_ENV === 'production') {
  module.exports = require('./index.prod');
} else {
  module.exports = require('./index.dev');
}
