var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/index',
  output: {
    filename: 'dist/ReactHotify.js',
    libraryTarget: 'umd',
    library: 'ReactHotify'
  },
  externals: [{
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  }],
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', include: path.join(__dirname, 'src') }
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin()
  ]
};