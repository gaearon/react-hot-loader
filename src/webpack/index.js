const fs = require('fs')
const path = require('path')
const { SourceNode, SourceMapConsumer } = require('source-map')
const makeIdentitySourceMap = require('./makeIdentitySourceMap')

let tagCommonJSExportsSource = null

function transform(source, map) {
  // This is a Webpack loader, but the user put it in the Babel config.
  if (source && source.types && source.types.IfStatement) {
    throw new Error(
      'React Hot Loader: You are erroneously trying to use a Webpack loader ' +
        'as a Babel plugin. Replace "react-hot-loader/webpack" with ' +
        '"react-hot-loader/babel" in the "plugins" section of your .babelrc file. ' +
        'While we recommend the above, if you prefer not to use Babel, ' +
        'you may remove "react-hot-loader/webpack" from the "plugins" section of ' +
        'your .babelrc file altogether, and instead add "react-hot-loader/webpack" ' +
        'to the "loaders" section of your Webpack configuration.',
    )
  }

  if (this.cacheable) {
    this.cacheable()
  }

  // Read the helper once.
  if (!tagCommonJSExportsSource) {
    tagCommonJSExportsSource = fs
      .readFileSync(path.join(__dirname, 'tagCommonJSExports.js'), 'utf8')
      // Babel inserts these.
      // Ideally we'd opt out for one file but this is simpler.
      .replace(/['"]use strict['"];/, '')
      // eslint comments don't need to end up in the output
      .replace(/\/\/ eslint-disable-line .*\n/g, '\n')
      .replace(/\/\* global.*\*\//, '')
      .split(/\n\s*/)
      .join(' ')
  }

  // Parameterize the helper with the current filename.
  const separator = '\n\n'
  const appendText = tagCommonJSExportsSource.replace(
    /__FILENAME__/g,
    JSON.stringify(this.resourcePath),
  )

  if (this.sourceMap === false) {
    return this.callback(null, [source, appendText].join(separator))
  }

  if (!map) {
    map = makeIdentitySourceMap(source, this.resourcePath) // eslint-disable-line no-param-reassign
  }
  const node = new SourceNode(null, null, null, [
    SourceNode.fromStringWithSourceMap(source, new SourceMapConsumer(map)),
    new SourceNode(null, null, this.resourcePath, appendText),
  ]).join(separator)

  const result = node.toStringWithSourceMap()
  return this.callback(null, result.code, result.map.toString())
}

module.exports = transform
