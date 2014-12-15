var webpack = require('webpack');

module.exports = {
  entry: './modules/index',
  output: {
    filename: 'dist/ReactHotAPI.js',
    libraryTarget: 'umd',
    library: 'ReactHotAPI'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin()
  ]
};