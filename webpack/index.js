'use strict';

var fs = require('fs');
var path = require('path');
var SourceNode = require('source-map').SourceNode;
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var makeIdentitySourceMap = require('./makeIdentitySourceMap');

var tagCommonJSExportsSource;

function transform(source, map) {
  if (this.cacheable) {
    this.cacheable();
  }

  if (!tagCommonJSExportsSource) {
    tagCommonJSExportsSource = fs.readFileSync(
      path.join(__dirname, 'tagCommonJSExports.js'),
      'utf8'
    ).split(/\n\s*/).join(' ');
  }

  var separator = '\n\n';
  var appendText = tagCommonJSExportsSource.replace(
    '__FILENAME__',
    JSON.stringify(path.basename(this.resourcePath))
  );

  if (this.sourceMap === false) {
    return this.callback(null, [
      source,
      appendText
    ].join(separator));
  }

  if (!map) {
    map = makeIdentitySourceMap(source, this.resourcePath);
  }
  var node = new SourceNode(null, null, null, [
    SourceNode.fromStringWithSourceMap(source, new SourceMapConsumer(map)),
    new SourceNode(null, null, this.resourcePath, appendText)
  ]).join(separator);

  var result = node.toStringWithSourceMap();
  this.callback(null, result.code, result.map.toString());
};

module.exports = transform;
