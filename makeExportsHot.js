'use strict';

var isReactClassish = require('./isReactClassish'),
    isReactElementish = require('./isReactElementish');

function makeExportsHot(m) {
  if (isReactElementish(m.exports)) {
    return false;
  }

  var freshExports = m.exports,
      foundReactClasses = false;

  if (isReactClassish(m.exports)) {
    m.exports = m.makeHot(m.exports, '__MODULE_EXPORTS');
    foundReactClasses = true;
  }

  for (var key in m.exports) {
    if (freshExports.hasOwnProperty(key) &&
        isReactClassish(freshExports[key])) {

      m.exports[key] = m.makeHot(freshExports[key], '__MODULE_EXPORTS_' + key);
      foundReactClasses = true;
    }
  }

  return foundReactClasses;
}

module.exports = makeExportsHot;