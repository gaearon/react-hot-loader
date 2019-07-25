/* eslint-disable global-require, import/no-unresolved, no-var, camelcase, func-names */
/* global __FILENAME__, reactHotLoaderGlobal */

;(function register() {
  // eslint-disable-line no-extra-semi
  /* react-hot-loader/webpack */
  var safe_require = function() {
    return typeof require === 'undefined' ? undefined : require('react-hot-loader');
  };

  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : safe_require()).default;

  if (!reactHotLoader) {
    return;
  }

  /* eslint-disable camelcase, no-undef */
  const webpackExports = typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__ : exports;
  /* eslint-enable camelcase, no-undef */
  if (!webpackExports) {
    return;
  }

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
