(function () {
  /* react-hot-loader/webpack */
  if (process.env.NODE_ENV !== 'production') {
    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
      return;
    }

    if (typeof module.exports === 'function') {
      __REACT_HOT_LOADER__.register(module.exports, 'module.exports', __FILENAME__);
      return;
    }

    for (let key in module.exports) {
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
})();
