/* eslint-disable flowtype/require-valid-file-annotation, no-console, import/extensions */
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import uglify from 'rollup-plugin-uglify'
import pkg from './package.json'

const commonPlugins = [
  json(),
  nodeResolve(),
  babel({plugins: ['external-helpers']}),
  commonjs({ignoreGlobal: true}),
]

const getConfig = (input, dist, env) => ({
  input,
  external: ['react'].concat(Object.keys(pkg.dependencies)),
  plugins: commonPlugins
    .concat(env ? [
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
    ] : [])
    .concat(env === 'production' ? [uglify()] : []),
  output: [
    {
      file: dist,
      format: 'cjs',
      exports: 'named',
      globals: {react: 'React'},
    },
  ],
})

export default [
  getConfig(
    'src/index.dev.js',
    'dist/react-hot-loader.development.js',
    'development'
  ),
  getConfig(
    'src/index.prod.js',
    'dist/react-hot-loader.production.min.js',
    'production'
  ),

  getConfig('src/babel.dev.js', 'dist/babel.development.js', 'development'),
  getConfig('src/babel.prod.js', 'dist/babel.production.min.js', 'production'),

  getConfig('src/webpack/index.js', 'dist/webpack.development.js', 'development'),
  getConfig('src/webpack/index.js', 'dist/webpack.production.js', 'production'),

  {
    input: 'src/webpack/webpackTagCommonJSExports.js',
    output: {
      file: 'dist/webpackTagCommonJSExports.js',
      format: 'cjs'
    }
  }
]
