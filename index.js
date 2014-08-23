var path = require('path');

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable();
  }

  var matches = 0,
      processedSource;

  processedSource = source.replace(/React\.createClass\s*\(\s*\{/g, function (match) {
    matches++;
    return '__hotUpdateAPI.createClass({';
  });

  if (!matches) {
    return source;
  }

  return [
    'var __hotUpdateAPI = (function () {',
    '  var React = require("react");',
    '  var getHotUpdateAPI = require(' + JSON.stringify(require.resolve('./getHotUpdateAPI')) + ');',
    '  return getHotUpdateAPI(React, ' + JSON.stringify(path.basename(this.resourcePath)) + ', module.id);',
    '})();',
    processedSource,
    'if (module.hot) {',
    '  module.hot.accept();',
    '  module.hot.dispose(function () {',
    '    var nextTick = require(' + JSON.stringify(require.resolve('next-tick')) + ');',
    '    nextTick(__hotUpdateAPI.updateMountedInstances);',
    '  });',
    '}'
  ].join('\n');
};
