(function () {
  /* react-hot-loader/webpack */
  if (process.env.NODE_ENV !== 'production') {
    function tagSource(fn, localName) {
      if (typeof fn !== 'function') {
        return;
      }
      if (fn.hasOwnProperty('__source')) {
        return;
      }
      try {
        Object.defineProperty(fn, '__source', {
          enumerable: false,
          configurable: true,
          value: {
            fileName: __FILENAME__,
            localName: localName
          }
        });
      } catch (err) { }
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