/* eslint-disable */
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['./src/index'],
  mode: 'development',
  devtool: 'none',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        //exclude: /node_modules|packages/,  // should work without exclude
        test: /\.js$/,
        use: ['react-hot-loader/webpack', 'babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      react: path.resolve(path.join(__dirname, './node_modules/react')),
      // 'react-hot-loader': path.resolve(
      //   path.join(__dirname, './../../'),
      // ),
      'babel-core': path.resolve(
        path.join(__dirname, './node_modules/@babel/core'),
      ),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      // uncomment this line to test RHL in "secure" env
      // template: "index_csp.html",
    }),
    new webpack.NamedModulesPlugin(),
  ],
}
