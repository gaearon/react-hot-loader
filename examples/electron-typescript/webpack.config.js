const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const env = process.env.NODE_ENV;

const appConfig = {
  mode: env || 'development',
  entry: ['./app/index'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    modules: ['node_modules'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.(j|t)s(x)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [
              ['@babel/preset-env', { targets: { browsers: 'last 1 version' } }],
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
            plugins: [
              // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              'react-hot-loader/babel',
            ],
          },
        },
      },
    ],
  },
};

const developmentConfig = {
  output: {
    publicPath: 'http://localhost:8080/',
  },
  plugins: [new ForkTsCheckerWebpackPlugin(), new webpack.NamedModulesPlugin()],
  devtool: 'eval-source-map',
};

const productionConfig = {
  output: {
    publicPath: '/',
  },
};

module.exports = merge(appConfig, env === 'production' ? productionConfig : developmentConfig);
