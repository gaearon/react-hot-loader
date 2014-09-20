var path = require('path');

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable();
  }

  var filename = path.basename(this.resourcePath),
      matches = 0,
      processedSource;

  processedSource = source.replace(/[Rr]eact\.createClass\s*\(/g, function (match) {
    matches++;
    return '__hotUpdateAPI.createClass(';
  });

  if (!matches) {
    return source;
  }

  return [
    'var __hotUpdateAPI = (function () {',
      'var React = require("react");',
      'var getHotUpdateAPI = require(' + JSON.stringify(require.resolve('./getHotUpdateAPI')) + ');',
      'return getHotUpdateAPI(React, ' + JSON.stringify(filename) + ', module.id);',
    '})();',
    'if (module.hot) {',
      'module.hot.accept(function (err) {',
        'if (err) {',
          'console.error("Cannot not apply hot update to " + ' + JSON.stringify(filename) + ' + ": " + err.message);',
        '}',
      '});',
      'module.hot.dispose(function () {',
        'var nextTick = require(' + JSON.stringify(require.resolve('next-tick')) + ');',
        'nextTick(__hotUpdateAPI.updateMountedInstances);',
      '});',
    '}'
  ].join(' ') + '\n\n' + processedSource;
};
