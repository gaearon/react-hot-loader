/* eslint-disable */
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['./src/index'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        exclude: /node_modules|packages/, // should work without exclude
        test: /\.js$/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      react: path.resolve(path.join(__dirname, './node_modules/react')),
      'react-dom': path.resolve(
        path.join(__dirname, './node_modules/@hot-loader/react-dom'),
      ),
      'babel-core': path.resolve(
        path.join(__dirname, './node_modules/@babel/core'),
      ),
    },
  },
  plugins: [new HtmlWebpackPlugin(), new webpack.NamedModulesPlugin()],
}
