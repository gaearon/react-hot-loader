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

### 1. Webpack Configuration
The first thing you'll need to do is create a Webpack config for development.  This config must be separate from the one you use for production.

Here is a basic example that we will build upon:
```
webpack.config.dev.js
```
{% highlight js %}
var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src')
    }]
  }
};
{% endhighlight %}

### 2. Add HotModuleReplacementPlugin
Now that we have a development config, we need to add Webpack's `HotModuleReplacementPlugin`.  This can be done by adding `new webpack.HotModuleReplacementPlugin()` to the `plugins` section:

{% highlight js %}
plugins: [
  new webpack.HotModuleReplacementPlugin()
]
{% endhighlight %}


### 3. Setup Development Server
If you are only rendering on the client, consider using `WebpackDevServer` as your development server.  It is easier to setup than `webpack-dev-middleware`.

#### 3.1. WebpackDevServer
Install `webpack-dev-server` via npm:
```
npm install webpack-dev-server
```

Inside your Webpack development config,

If you are going to be using server-side rendering, consider using Express + `webpack-dev-middleware`.  It is more work to set up than `WebpackDevServer`, but you will have more control.

#### 3.2. webpack-dev-middleware

### 4. Use HMR to Replace Root Component
Inside `index.js`, or wherever you are rendering your component, you need to add the following to re-render the root component:

{% highlight js %}
if (module.hot) {
  module.hot.accept('./App', () => {
    ReactDOM.render(
      <AppContainer>
        <App/>
      </AppContainer>,
      rootEl
    );
  });
{% endhighlight %}

### 5. Add React Hot Loader To Preserve State
Now it's time to add React Hot Loader using either the Babel or Webpack plugin.

- If you use Babel:
  - Add `react-hot-loader/babel` to `plugins` inside of `.babelrc`.

{% highlight js %}
{
  "presets": ["es2015", "stage-0", "react"],
  "plugins": ["react-hot-loader/babel"]
}
{% endhighlight %}

- If you don't use Babel:
  - Add `react-hot-loader/webpack` to `loaders` in your Webpack config.

{% highlight js %}

{% endhighlight %}


- Add `react-hot-loader/patch` as the first entry point in your Webpack config.

### 6. AppContainer
The final step is to 

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
  'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
  './scripts/index' // Your appʼs entry point
]
{% endhighlight %}

Next we need to tell Webpack to use React Hot Loader for the components. If you configured Webpack for React, you may already use `babel-loader` (ex `6to5-loader`) or `jsx-loader` for JS(X) files. Find that line in <a href="https://github.com/gaearon/react-hot-boilerplate/blob/master/webpack.config.js">`webpack.config.js`</a> and put `react-hot` before other loader(s).

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
  new webpack.HotModuleReplacementPlugin()
]
{% endhighlight %}

>Note: If you are using Webpack Dev Server command line interface instead of its Node API, and you specify `--hot` mode, *don't* add this plugin. It is mutually exclusive with the `--hot` option.

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
