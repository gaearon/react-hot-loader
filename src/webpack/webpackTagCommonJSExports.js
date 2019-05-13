/* eslint-disable global-require, import/no-unresolved */
/* global __FILENAME__ */

(function register() {
  // eslint-disable-line no-extra-semi
  if (typeof require === 'undefined') {
     return;
  }
  /* react-hot-loader/webpack */
  const reactHotLoader = require('react-hot-loader').default;

  if (!reactHotLoader) {
    return;
  }

  /* eslint-disable camelcase, no-undef */
  const webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : exports;
  /* eslint-enable camelcase, no-undef */

  if (typeof webpackExports === 'function') {
    reactHotLoader.register(webpackExports, 'module.exports', __FILENAME__);
    return;
  }

  /* eslint-disable no-restricted-syntax */
  for (const key in webpackExports) {
    /* eslint-enable no-restricted-syntax */
    if (!Object.prototype.hasOwnProperty.call(webpackExports, key)) {
      continue;
    }

    let namedExport;
    try {
      namedExport = webpackExports[key];
    } catch (err) {
      continue;
    }

    reactHotLoader.register(namedExport, key, __FILENAME__);
  }
})();
