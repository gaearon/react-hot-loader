'use strict';

var path = require('path'),
    SourceNode = require('source-map').SourceNode,
    SourceMapConsumer = require('source-map').SourceMapConsumer,
    makeIdentitySourceMap = require('./makeIdentitySourceMap'),
    loaderUtils = require('loader-utils');

module.exports = function (source, map) {
  if (this.cacheable) {
    this.cacheable();
  }

  var resourcePath = this.resourcePath;
  if (/[\\/]webpack[\\/]buildin[\\/]module\.js|[\\/]react-hot-loader[\\/]|[\\/]react[\\/]lib[\\/]/.test(resourcePath)) {
    return this.callback(null, source, map);
  }

  var filename = path.basename(resourcePath),
      separator = '\n\n',
      params = loaderUtils.parseQuery(this.query),
      acceptUpdates = !params.manual,
      // passed to react-hot-api
      prependText,
      appendText,
      node,
      result;

  if (typeof params.errorReporter === 'string') {
    var errorReporter = params.errorReporter;
  }

  prependText = [
    '/* REACT HOT LOADER */',
    'if (module.hot) {',
      '(function () {',
        'var ReactHotAPI = require(' + JSON.stringify(require.resolve('react-hot-api')) + '),',
            'RootInstanceProvider = require(' + JSON.stringify(require.resolve('./RootInstanceProvider')) + '),',
            'ReactMount = require("react/lib/ReactMount"),',
            'React = require("react")' + (params.errorReporter ? ',' : ';'),
            params.errorReporter ? 'ErrorReporter = require(' + JSON.stringify(errorReporter) + '),' : '',
            params.errorReporter ? 'options = {ErrorReporter: ErrorReporter};': '',

        'module.makeHot = module.hot.data ? module.hot.data.makeHot : ReactHotAPI(function () {',
          'return RootInstanceProvider.getRootInstances(ReactMount);',
        '}, React, options);',
      '})();',
    '}',
    '(function () {',
  ].join('\n');

  appendText = [
    '/* REACT HOT LOADER */',
    '}).call(this);',
    'if (module.hot) {',
      '(function () {',
        'module.hot.dispose(function (data) {',
          'data.makeHot = module.makeHot;',
        '});',

        'if (module.exports && module.makeHot) {',
          'var makeExportsHot = require(' + JSON.stringify(require.resolve('./makeExportsHot')) + '),',
              'foundReactClasses = false;',

          'if (makeExportsHot(module, require("react"))) {',
            'foundReactClasses = true;',
          '}',

          'var shouldAcceptModule = ' + JSON.stringify(acceptUpdates) + ' && foundReactClasses;',
          'if (shouldAcceptModule) {',
            'module.hot.accept(function (err) {',
              'if (err) {',
                'console.error("Cannot not apply hot update to " + ' + JSON.stringify(filename) + ' + ": " + err.message);',
              '}',
            '});',
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
