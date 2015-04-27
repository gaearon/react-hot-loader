var webpack = require('webpack');

module.exports = {
  entry: './src/index',
  output: {
    filename: 'dist/ReactHotAPI.js',
    libraryTarget: 'umd',
    library: 'ReactHotAPI'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin()
  ]
};