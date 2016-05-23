/* global __FILENAME__ */

;(function register() { // eslint-disable-line no-extra-semi
  /* react-hot-loader/webpack */
  if (module.hot) {
    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
      return;
    }

    if (typeof module.exports === 'function') {
      __REACT_HOT_LOADER__.register(module.exports, 'module.exports', __FILENAME__);
      return;
    }

    for (const key in module.exports) { // eslint-disable-line no-restricted-syntax
      if (!Object.prototype.hasOwnProperty.call(module.exports, key)) {
        continue;
      }

      let namedExport;
      try {
        namedExport = module.exports[key];
      } catch (err) {
        continue;
      }

      __REACT_HOT_LOADER__.register(namedExport, key, __FILENAME__);
    }
  }
}());
