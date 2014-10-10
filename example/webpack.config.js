var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: ['webpack/hot/dev-server', './app'],
	devtool: 'source-map',
	output: {
		path: path.join(__dirname, 'output'),
		filename: 'bundle.js'
	},
	resolveLoader: {
		modulesDirectories: ['..', 'node_modules']
	},
	resolve: {
		extensions: ['', '.jsx', '.js']
	},
	module: {
		loaders: [
			{ test: /\.jsx$/, loaders: ['react-hot', 'jsx'] }
		]
	}
};
