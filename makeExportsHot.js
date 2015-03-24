'use strict';

var isReactClassish = require('./isReactClassish'),
    isReactElementish = require('./isReactElementish');

function makeExportsHot(m, React) {
  if (isReactElementish(m.exports)) {
    // React elements are never valid React classes
    return false;
  }

  var freshExports = m.exports,
      exportsReactClass = isReactClassish(m.exports, React),
      foundReactClasses = false;

  if (exportsReactClass) {
    m.exports = m.makeHot(m.exports, '__MODULE_EXPORTS');
    foundReactClasses = true;
  }

  for (var key in m.exports) {
    if (!Object.prototype.hasOwnProperty.call(freshExports, key)) {
      continue;
    }

    if (exportsReactClass && key === 'type') {
      // React 0.12 also puts classes under `type` property for compat.
      // Skip to avoid updating twice.
      continue;
    }

    if (!isReactClassish(freshExports[key], React)) {
      continue;
    }

    if (Object.getOwnPropertyDescriptor(m.exports, key).writable) {
      m.exports[key] = m.makeHot(freshExports[key], '__MODULE_EXPORTS_' + key);
      foundReactClasses = true;
    } else {
      console.warn("Can't make class " + key + " hot reloadable due to being read-only. You can exclude files or directories (for example, /node_modules/) using 'exclude' option in loader configuration.");
    }
  }

  return foundReactClasses;
}

module.exports = makeExportsHot;
