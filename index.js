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
  if (/node_modules/.test(resourcePath)) {
    // Skip non-user code, including React and Webpack internals
    return this.callback(null, source, map);
  }

  var acceptUpdates = this.query !== '?manual',
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
        '    RootInstanceProvider = require(' + JSON.stringify(require.resolve('./RootInstanceProvider')) + ');',
        '',
        'if (typeof ReactHotAPI === "function" && typeof RootInstanceProvider === "object") {',
          'module.makeHot = module.hot.data ? module.hot.data.makeHot : ReactHotAPI(RootInstanceProvider.getRootInstances);',
        '}',
      '})();',
    '}'
  ].join(' ');

  appendText = [
    '/* REACT HOT LOADER */',
    'if (module.hot) {',
      '(function () {',
        acceptUpdates ? [
          'module.hot.accept(function (err) {',
            'if (err) {',
              'console.error("Cannot not apply hot update to " + ' + JSON.stringify(filename) + ' + ": " + err.message);',
            '}',
          '});'
        ].join(' ') : '',
        'module.hot.dispose(function (data) {',
        '  data.makeHot = module.makeHot;',
        '});',
        'if (module.exports && module.makeHot) {',
          'var freshModuleExports = module.exports;',
          'module.exports = module.makeHot(module.exports, "__MODULE_EXPORTS");',
          'for (var key in module.exports) {',
            'if (freshModuleExports[key] && freshModuleExports.hasOwnProperty(key)) {',
              'module.exports[key] = module.makeHot(freshModuleExports[key], "__MODULE_EXPORTS_" + key);',
            '}',
          '}',
        '}',
      '})();',
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
