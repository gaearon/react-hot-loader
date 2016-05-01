;(function () {
  /* react-hot-loader/webpack */
  if (process.env.NODE_ENV !== 'production') {
    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
      return;
    }

    const fileName = __FILENAME__;
    function tagSource(fn, localName) {
      if (typeof fn !== 'function') {
        return;
      }

      const id = fileName + '#' + localName;
      __REACT_HOT_LOADER__.register(id, fn);
    }

    if (typeof module.exports === 'function') {
      tagSource(module.exports, 'module.exports');
      return;
    }

    for (let key in module.exports) {
      if (Object.prototype.hasOwnProperty.call(module.exports, key)) {
        tagSource(module.exports[key], `module.exports.${key}`);
      }
    }
  }
})();