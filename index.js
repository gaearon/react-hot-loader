'use strict';

var path = require('path'),
    SourceNode = require('source-map').SourceNode,
    SourceMapConsumer = require('source-map').SourceMapConsumer,
    makeIdentitySourceMap = require('./makeIdentitySourceMap');

var REACT_CLASS_RE = /[Rr]eact\.createClass\s*\(/g;

module.exports = function (source, map) {
  if (this.cacheable) {
    this.cacheable();
  }

  if (!source.match(REACT_CLASS_RE)) {
    return this.callback(null, source, map);
  }

  var resourcePath = this.resourcePath,
      filename = path.basename(resourcePath),
      separator = '\n\n',
      prependText,
      processedSource,
      node,
      result;

  prependText = [
    'var __HUA = (function () {',
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
        'nextTick(__HUA.updateMountedInstances);',
      '});',
    '}'
  ].join(' ');

  processedSource = source.replace(REACT_CLASS_RE, '__HUA.createClass(');

  if (this.sourceMap === false) {
    return this.callback(null, [
      prependText,
      processedSource
    ].join(separator));
  }

  if (!map) {
    map = makeIdentitySourceMap(source, this.resourcePath);
  }

  node = new SourceNode(null, null, null, [
    new SourceNode(null, null, this.resourcePath, prependText),
    SourceNode.fromStringWithSourceMap(processedSource, new SourceMapConsumer(map))
  ]).join(separator);

  result = node.toStringWithSourceMap();

  this.callback(null, result.code, result.map.toString());
};
