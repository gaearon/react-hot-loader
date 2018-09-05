/* eslint-disable */
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const babelPlugin = path.resolve(
  __dirname,
  './node_modules/react-hot-loader/babel',
)

module.exports = {
  entry: ['./src/index'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        exclude: /node_modules|packages/,
        test: /\.js$/,
        use: 'babel-loader',
      },
      {
        include: /node_modules/,
        test: /\.js$/,
        use: {
          loader: 'react-hot-loader/webpack',
        },
      },
      /*
      // babel is an option, but slow option
      {
        include: /node_modules/,
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            // plugins: ['react-hot-loader/babel'] // <<----- you need this

            plugins: [babelPlugin], // you DON'T need this
          },
        },
      },
      /* */
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      // you don't need this
      react: path.resolve(path.join(__dirname, './node_modules/react')),
      'react-hot-loader': path.resolve(
        path.join(__dirname, './node_modules/react-hot-loader'),
      ),
      'babel-core': path.resolve(
        path.join(__dirname, './node_modules/@babel/core'),
      ),
    },
  },
  plugins: [new HtmlWebpackPlugin(), new webpack.NamedModulesPlugin()],
}
