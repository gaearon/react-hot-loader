(function () {
  /* react-hot-loader/webpack */
  var hasOwn = Object.prototype.hasOwnProperty;

  function tag(fn, exportName) {
    if (typeof fn !== 'function') {
      return;
    }
    if (hasOwn.call(fn, '__source')) {
      return;
    }
    try {
      Object.defineProperty(fn, '__source', {
        enumerable: false,
        configurable: true,
        value: {
          fileName: __FILENAME__,
          exportName: exportName
        }
      });
    } catch (err) { }
  }

  if (typeof module.exports === 'function') {
    tag(module.exports, '*');
    return;
  }

  for (var key in module.exports) {
    if (hasOwn.call(module.exports, key)) {
      tag(module.exports[key], key)
    }
  }
})();