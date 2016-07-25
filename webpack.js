'use strict';

var path = require('path'),
    SourceNode = require('source-map').SourceNode,
    SourceMapConsumer = require('source-map').SourceMapConsumer,
    makeIdentitySourceMap = require('./makeIdentitySourceMap');

module.exports = function (source, map) {
  if (this.cacheable) {
    this.cacheable();
  }

  var filename = path.basename(this.resourcePath);
  var separator = '\n\n';
  var appendText;
  var node;
  var result;

  appendText = [
    '(function () {',
      'for (var key in module.exports) {',
        'if (!Object.prototype.hasOwnProperty.call(module.exports, key)) {',
          'continue;',
        '}',
        'var exported = module.exports[key];',
        'try {',
          'if (typeof exported !== "function") {',
            'continue;',
          '}',
          'if (Object.prototype.hasOwnProperty.call(exported, "__source")) {',
            'continue;',
          '}',
          'Object.defineProperty(exported, "__source", {',
            'enumerable: false,',
            'configurable: true,',
            'value: {',
              'fileName: ' + JSON.stringify(filename) + ',',
              'exportName: key',
            '}',
          '})',
        '} catch (err) { }',
      '}',
    '})();'
  ].join(' ');

  if (this.sourceMap === false) {
    return this.callback(null, [
      source,
      appendText
    ].join(separator));
  }

  if (!map) {
    map = makeIdentitySourceMap(source, this.resourcePath);
  }

  node = new SourceNode(null, null, null, [
    SourceNode.fromStringWithSourceMap(source, new SourceMapConsumer(map)),
    new SourceNode(null, null, this.resourcePath, appendText)
  ]).join(separator);

  result = node.toStringWithSourceMap();

  this.callback(null, result.code, result.map.toString());
};
