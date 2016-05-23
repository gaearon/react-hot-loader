/* eslint-disable global-require */

'use strict';

if (module.hot) {
  module.exports = require('./AppContainer.dev');
} else {
  module.exports = require('./AppContainer.prod');
}
