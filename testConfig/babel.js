const { createTransformer } = require('babel-jest')
const path = require('path')

const TARGET_ES2015 = 'es2015'
const TARGET_MODERN = 'modern'
const TARGETS = [TARGET_ES2015, TARGET_MODERN]

const getOptions = target => {
  switch (target) {
    case TARGET_ES2015:
      return {
        babelrc: false,
        presets: ['env', 'react'],
        plugins: [
          'transform-class-properties',
          'transform-object-rest-spread',
          path.resolve(__dirname, '../packages/react-hot-loader/lib/babel'),
        ],
      }
    case TARGET_MODERN:
      return {
        babelrc: false,
        presets: [
          [
            'env',
            {
              targets: {
                browsers: 'chrome 60',
              },
            },
          ],
          'react',
        ],
        plugins: [
          'transform-class-properties',
          'transform-object-rest-spread',
          path.resolve(__dirname, '../packages/react-hot-loader/lib/babel'),
        ],
      }
    default:
      throw new Error('You must specify a BABEL_TARGET: es2015 or modern')
  }
}

module.exports = createTransformer(getOptions(process.env.BABEL_TARGET))
module.exports.getOptions = getOptions
module.exports.TARGETS = TARGETS
