'use strict';

var path = require('path'),
    SourceNode = require('source-map').SourceNode,
    SourceMapConsumer = require('source-map').SourceMapConsumer,
    makeIdentitySourceMap = require('./makeIdentitySourceMap');

module.exports = function (source, map) {
  if (this.cacheable) {
    this.cacheable();
  }

  var resourcePath = this.resourcePath;
  if (/[\\/]webpack[\\/]buildin[\\/]module\.js|[\\/]react-hot-loader[\\/]|[\\/]react[\\/]lib[\\/]/.test(resourcePath)) {
    return this.callback(null, source, map);
  }

  var acceptUpdates = this.query.indexOf('manual') === -1,
      reactModule = this.query.indexOf('native') !== -1 ? '"react-native"' : '"react"',
      filename = path.basename(resourcePath),
      separator = '\n\n',
      prependText,
      appendText,
      node,
      result;

  prependText = [
    '/* REACT HOT LOADER */',
    'if (module.hot) {',
      '(function () {',
        'var ReactHotAPI = require(' + JSON.stringify(require.resolve('react-hot-api')) + '),',
            'React = require(' + reactModule + ');',
        'module.makeHot = module.hot.data ? module.hot.data.makeHot : ReactHotAPI(React);',
      '})();',
    '}',
    'try {',
      '(function () {',
  ].join(' ');

  appendText = [
      '/* REACT HOT LOADER */',
      '}).call(this);',
    '} finally {',
      'if (module.hot) {',
        '(function () {',
          'var foundReactClasses = module.hot.data && module.hot.data.foundReactClasses || false;',
          'if (module.exports && module.makeHot) {',
            'var makeExportsHot = require(' + JSON.stringify(require.resolve('./makeExportsHot')) + ');',
            'if (makeExportsHot(module, require(' + reactModule + '))) {',
              'foundReactClasses = true;',
            '}',
            'var shouldAcceptModule = ' + JSON.stringify(acceptUpdates) + ' && foundReactClasses;',
            'if (shouldAcceptModule) {',
              'module.hot.accept(function (err) {',
                'if (err) {',
                  'console.error("Cannot apply hot update to " + ' + JSON.stringify(filename) + ' + ": " + err.message);',
                '}',
              '});',
            '}',
          '}',
          'module.hot.dispose(function (data) {',
            'data.makeHot = module.makeHot;',
            'data.foundReactClasses = foundReactClasses;',
          '});',
        '})();',
      '}',
    '}'
  ].join(' ');

  if (this.sourceMap === false) {
    return this.callback(null, [
      prependText,
      source,
      appendText
    ].join(separator));
  }

  if (!map) {
    map = makeIdentitySourceMap(source, this.resourcePath);
  }

  node = new SourceNode(null, null, null, [
    new SourceNode(null, null, this.resourcePath, prependText),
    SourceNode.fromStringWithSourceMap(source, new SourceMapConsumer(map)),
    new SourceNode(null, null, this.resourcePath, appendText)
  ]).join(separator);

  result = node.toStringWithSourceMap();

  this.callback(null, result.code, result.map.toString());
};
