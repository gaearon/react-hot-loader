'use strict';

const fs = require('fs');
const path = require('path');
const { SourceNode, SourceMapConsumer } = require('source-map');
const makeIdentitySourceMap = require('./makeIdentitySourceMap');

let tagCommonJSExportsSource = null;

function transform(source, map) {
  if (source && source.types && source.types.IfStatement) {
    throw new Error(
      'React Hot Loader: You are erroneously trying to use a Webpack loader ' +
      'as a Babel plugin. Replace "react-hot-loader/webpack" with ' +
      '"react-hot-loader/babel" in the "plugins" section of your .babelrc file. ' +
      'While we recommend the above, if you prefer not to use Babel, ' +
      'you may remove "react-hot-loader/webpack" from the "plugins" section of ' +
      'your .babelrc file altogether, and instead add "react-hot-loader/webpack" ' +
      'to the "loaders" section of your Webpack configuration.'
    );
  }

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
