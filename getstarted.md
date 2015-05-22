---
layout: page
title: Get Started
---

React Hot Loader is a plugin for Webpack that allows instantaneous live refresh without losing state while editing React components.

If you use Browserify, RequireJS or another JavaScript bundler, you need to switch to Webpack first. Webpack supports all popular module formats. If you know a good guide on migrating to Webpack, <a href="https://github.com/gaearon/react-hot-loader/issues/new" target="_blank">let me know</a> and Iʼll link to it.

This tutorial assumes that you already have a working Webpack configuration and `WebpackDevServer` compiles and serves your code. If youʼd rather play with a ready-made example, try <a href="https://github.com/gaearon/react-hot-boilerplate" target="_blank">react-hot-boilerplate</a>.

### Installation

The only extra package that you need to install is `react-hot-loader`. Do that by running

{% highlight sh %}
npm install --save-dev react-hot-loader
{% endhighlight %}

### Development Server

With the loader installed, it is now time to configure a small dev server for Webpack to use. The key aspect of this configuration is that when creating a `new WebpackDevServer`, you need to specify `hot: true` as an option. For example, you can add an entirely new file called `server.js` and simply include the <a href="https://github.com/gaearon/react-hot-boilerplate/blob/master/server.js" target="_blank">server provided in the boilerplate</a>.

If you like, you may edit <a href="https://github.com/gaearon/react-hot-boilerplate/blob/master/package.json" target='_blank'>`package.json`</a> to call the Webpack server on `npm start`:

{% highlight js %}
"scripts": {
  "start": "node server.js"
},
{% endhighlight %}

### Configuration

It is time to configure Webpack itself.
In your <a href="https://github.com/gaearon/react-hot-boilerplate/blob/master/webpack.config.js" target="_blank">`webpack.config.js`</a>, configure the `entry` to include the dev server and the hot reloading server. Put them in array before your appʼs entry point:

{% highlight js %}
entry: [
  'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
  'webpack/hot/only-dev-server',
  './scripts/index' // Your appʼs entry point
]
{% endhighlight %}

Next we need to tell Webpack to use React Hot Loader for the components. If you configured Webpack for React, you may already use `jsx-loader` or `6to5-loader` for JS(X) files. Find that line in <a href="https://github.com/gaearon/react-hot-boilerplate/blob/master/webpack.config.js">`webpack.config.js`</a> and put `react-hot` before other loader(s).

If you only had one loader before, be sure to change `loader` to `loaders` so it takes array as an input:

{% highlight js %}
module: {
  loaders: [
    { test: /\.jsx?$/, loaders: ['react-hot', 'jsx?harmony'], include: path.join(__dirname, 'src') }
  ]
}
{% endhighlight %}

If you donʼt use JSX, itʼs fine. Just make sure your components are all transformed with `react-hot`.

Finally, the Hot Replacement plugin from Webpack has to be included in the `plugins` section of the config. If you have not used Webpack plugins before, donʼt forget to add `var webpack = require('webpack');` at the top of your config. Then just add `new webpack.HotModuleReplacementPlugin()` to the `plugins` section:

{% highlight js %}
plugins: [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
]
{% endhighlight %}

`webpack.NoErrorsPlugin` is an optional plugin that tells the reloader to not reload if there is a syntax error in your code. The error is simply printed in the console, and the component will reload when you fix the error.

### Usage

Start the server we configured earlier via `npm start` and open the dev server URL in browser. To test hot reloading, just edit any component and watch the changes happen live!

### Troubleshooting

If hot reloading doesnʼt work, itʼs usually due to a deviation from the configuration described above. Make sure to compare your setup to <a href="https://github.com/gaearon/react-hot-boilerplate" target="_blank">`react-hot-boilerplate`</a> and verify that the boilerplate works for you.

If youʼre stuck, <a href="https://github.com/gaearon/react-hot-loader/issues/new" target="_blank">file an issue</a> or ask for help in <a href="https://gitter.im/gaearon/react-hot-loader" target="_blank">the Gitter room</a>, and weʼll try to figure it out.

Happy hot reloading!

<br>
<small>
This guide was originally written as a blog post by [Joseph Furlott](http://jmfurlott.com/setting-up-react-hot-loader/).
<br>
You can find a more technical explanation in an [older introductory post](/react-hot-loader/2014/07/23/integrating-jsx-live-reload-into-your-react-workflow/).
</small>
