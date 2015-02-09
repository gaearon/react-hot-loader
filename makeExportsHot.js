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
      if (Object.getOwnPropertyDescriptor(m.exports, key).writable) {
        m.exports[key] = m.makeHot(freshExports[key], '__MODULE_EXPORTS_' + key);
        foundReactClasses = true;
      } else {
        console.warn("Can't make class " + key + " hot reloadable due to being read-only. You can exclude files or directories (for example, /node_modules/) using 'exclude' option in loader configuration.");
      }
    }
  }

  return foundReactClasses;
}

module.exports = makeExportsHot;
