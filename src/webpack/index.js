'use strict';

const fs = require('fs');
const path = require('path');
const { SourceNode, SourceMapConsumer } = require('source-map');
const makeIdentitySourceMap = require('./makeIdentitySourceMap');

let tagCommonJSExportsSource = null;

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

  const separator = '\n\n';
  const appendText = tagCommonJSExportsSource.replace(
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
  const node = new SourceNode(null, null, null, [
    SourceNode.fromStringWithSourceMap(source, new SourceMapConsumer(map)),
    new SourceNode(null, null, this.resourcePath, appendText)
  ]).join(separator);

  const result = node.toStringWithSourceMap();
  this.callback(null, result.code, result.map.toString());
};

module.exports = transform;
