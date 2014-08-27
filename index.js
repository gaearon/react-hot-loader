var path = require('path');
var SourceNode = require('source-map').SourceNode;
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var SourceMapGenerator = require('source-map').SourceMapGenerator;

module.exports = function (source, map) {
  if (this.cacheable) {
    this.cacheable();
  }

  if (!/React\.createClass\s*\(\s*\{/.test(source)) {
    return this.callback(null, source, map);
  }

  var filename = path.basename(this.resourcePath),
      prependText,
      appendText,
      processedSource,
      node,
      strWithMap;

  prependText = [
    'var __HUA = (function () {',
    '  var React = require("react");',
    '  var getHotUpdateAPI = require(' + JSON.stringify(require.resolve('./getHotUpdateAPI')) + ');',
    '  return getHotUpdateAPI(React, ' + JSON.stringify(filename) + ', module.id);',
    '})();'
  ].join('\n');

  appendText = [
    'if (module.hot) {',
    '  module.hot.accept(function (err) {',
    '    if (err) {',
    '      console.error("Cannot not apply hot update to " + ' + JSON.stringify(filename) + ' + ": " + err.message);',
    '    }',
    '  });',
    '  module.hot.dispose(function () {',
    '    var nextTick = require(' + JSON.stringify(require.resolve('next-tick')) + ');',
    '    nextTick(__HUA.updateMountedInstances);',
    '  });',
    '}'
  ].join('\n');

  processedSource = source.replace(/React\.createClass\s*\(\s*\{/g, '__HUA.createClass({');

  // No sourcemaps
  if (!map) {
    return this.callback(null, [prependText, processedSource, appendText].join('\n'));
  }

  // Handle sourcemaps
  node = new SourceNode(null, null, null, [
    new SourceNode(null, null, null, prependText),
    SourceNode.fromStringWithSourceMap(processedSource, new SourceMapConsumer(map)),
    new SourceNode(null, null, null, appendText)
  ]).join('\n');

  strWithMap = node.toStringWithSourceMap();
  this.callback(null, strWithMap.code, strWithMap.map.toString());
};
