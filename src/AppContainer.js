'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./AppContainer.prod');
} else {
  module.exports = require('./AppContainer.dev');
}
