'use strict';

var isReactClassish = require('./isReactClassish'),
    isReactElementish = require('./isReactElementish');

function makeExportsHot(m, React) {
  function testMembers(exports) {
    if (isReactElementish(exports, React)) {
        // React elements are never valid React classes
        return false;
    }

    var freshExports = exports,
        exportsReactClass = isReactClassish(exports, React),
        foundReactClasses = false;

    if (exportsReactClass) {
        exports = m.makeHot(exports, '__MODULE_EXPORTS');
        foundReactClasses = true;
    }

    for (var key in exports) {
        if (!Object.prototype.hasOwnProperty.call(freshExports, key)) {
        continue;
        }

        if (exportsReactClass && key === 'type') {
        // React 0.12 also puts classes under `type` property for compat.
        // Skip to avoid updating twice.
        continue;
        }

        var value;
        try {
        value = freshExports[key];
        } catch (err) {
        continue;
        }

        if (!isReactClassish(value, React)) {
        continue;
        }

        if (Object.getOwnPropertyDescriptor(exports, key).writable) {
        exports[key] = m.makeHot(value, '__MODULE_EXPORTS_' + key);
        foundReactClasses = true;
        } else {
        console.warn("Can't make class " + key + " hot reloadable due to being read-only. To fix this you can try two solutions. First, you can exclude files or directories (for example, /node_modules/) using 'exclude' option in loader configuration. Second, if you are using Babel, you can enable loose mode for `es6.modules` using the 'loose' option. See: http://babeljs.io/docs/advanced/loose/ and http://babeljs.io/docs/usage/options/");
        }
    }
    return foundReactClasses;
  }

  if (testMembers(m.exports)) {
      return true;
  }
  else if (typeof m.exports.default == "object") {
      return testMembers(m.exports.default);
  }
  return false;
}

module.exports = makeExportsHot;
