'use strict'

if (!module.hot || process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/react-hot-loader.production.min.js');
} else {
  var evalAllowed = false;
  try {
    eval('evalAllowed = true');
  } catch (e) {
    // eval not allowed due to CSP
  }

  // RHL needs setPrototypeOf to operate Component inheritance, and eval to patch methods
  var jsFeaturesPresent = typeof window !== 'undefined' && !!Object.setPrototypeOf;

  if (!jsFeaturesPresent && evalAllowed) {
    // we are not in prod mode, but RHL could not be activated
    console.warn('React-Hot-Loader is not supported in this environment');
    module.exports = require('./dist/react-hot-loader.production.min.js');
  } else {
    module.exports = window.reactHotLoaderGlobal = require('./dist/react-hot-loader.development.js');
  }
}
