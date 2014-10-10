var webpack = require('webpack');

var port = JSON.parse(process.env.npm_package_config_port || 3000),
    subdomain = JSON.parse(process.env.npm_package_config_subdomain),
    url = subdomain ?
      'https://' + subdomain + '.localtunnel.me' :
      'http://localhost:' + port;

module.exports = {
  // If it gets slow on your project, change to 'eval':
  devtool: 'source-map',
  entry: [
    'webpack-dev-server/client?' + url,
    'webpack/hot/only-dev-server',
    './scripts/index'
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/scripts/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['react-hot', 'jsx?harmony'] },
    ]
  }
};
