/* eslint-disable global-require */

'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./patch.prod');
} else {
  module.exports = require('./patch.dev');
}
