/* eslint-disable global-require */

'use strict';

if (module.hot) {
  module.exports = require('./patch.dev');
} else {
  module.exports = require('./patch.prod');
}
