---
layout: post
title: "Integrating JSX live reload into your React workflow"
---

Do you want [Bret Victoresque](http://vimeo.com/36579366) live reload for your React app as you edit it?

<iframe src="//player.vimeo.com/video/100010922" width="800" height="461" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

Meet **[react-hot-loader](https://github.com/gaearon/react-hot-loader)**, a drop-in Webpack [loader](http://webpack.github.io/docs/loaders.html)[^1] you can use to **enable live editing for React components in your projects.** No browser plugins or IDE hooks required.

It marries Webpack Hot Module Replacement (HMR) with React.

You can use this if:

* Your React components donʼt have nasty side-effects;
* Youʼre willing to switch to [Webpack](https://github.com/webpack/webpack) for modules[^2] ([see an example](#integration));
* You have a spare couple of hours (minutes if you use Webpack).

Donʼt worry if you donʼt know what Webpack is. In **[Integration](#integration)** section, Iʼll guide you through integrating this into the [official React tutorial](http://facebook.github.io/react/docs/tutorial.html) app. The steps to get this goodness into your project should roughly be the same.

------

<h2 id="not-magic">What It Is and Hot It Works</h2>

This part explains how react-hot-loader works.  
**If you donʼt care and want to start using it now, [skip this part](#integration).**

### What Is Hot Module Replacement?

A few weeks ago, while porting Stampsy from RequireJS to Webpack, I discovered that Webpack supports something called [Hot Module Replacement](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html):

>Hot Module Replacement (HMR) is a way of exchanging modules in a running application (and adding/removing modules). You can update changed modules without a full page reload.

Basically, it is an opt-in feature of Webpack that allows each module to specify custom behavior (by default Webpack reloads the page) when a newer version of itself or its dependencies is available (i.e. when you save a file in the editor). It works together with a dev server, such as [webpack-dev-server](http://webpack.github.io/docs/webpack-dev-server.html).

When a source file changes, webpack-dev-server tells the Webpack runtime (which is small and included in the generated bundle) that an update to some module is available. Webpack runtime then asks the updated module whether it can accept updates, going up the dependency chain. **If any of modules in chain declare that they *know* how to handle an update by registering a handler, Webpack will invoke it instead of reloading the page.**

### Hot Module Replacement by Example

Webpackʼs [style-loader](https://github.com/webpack/style-loader) uses HMR API to [replace `<style>` tag](https://github.com/webpack/docs/wiki/hot-module-replacement#example-2-hot-replace-css) when CSS file changes. This gives you LiveReload-like experience. But HMR is much more than that, because it can be used for any kind of module, including JS, as long as you can handle an update in a way that makes sense for your application.

Say we have `parentModule` that depends on `a` and `b`:

{% highlight js %}
// parentModule.js

var a = require('./a');
var b = require('./b');

// ... your module code ...

// In production, `module.hot` is `false` and condition is cut:
if (module.hot) {

  // This is where we can call HMR API (module.hot)
  // and register update handlers for dependencies.

  // Means "I know what to do when ./a changes!"
  module.hot.accept('./a', function () {

    console.log('My dependency changed!');
    console.log('I gotta do something with the new version');

    // It makes sense to update the variable.
    // require will now return the fresh version:
    a = require('./a');

    // You'll probably want to do something else too,
    // depending on the nature of dependency and its side-effects:

    // * Re-render the view?
    // * Recreate or reassign some objects?
    // * Give up and reload? (default if you omit this handler)
  });

}
{% endhighlight %}

If you run Webpack server with HMR enabled and edit `a.js`, instead of reloading the page, Webpack will invoke your callback. Doing `require('./a')` inside this callback will give you an updated version of `a.js`, and itʼs up to you to do something with it. However, if you edit `b.js`, Webpack wonʼt find any HMR handler and will fall back to reloading the page.

Finally, updates bubble *up the dependency hierarchy* so if somebody `accept`s `parentModule` itself, editing `a` or `b` will not cause a reload. We can say that module updates bubble similarly to browser events, and `module.hot.accept` acts like `stopPropagation` and `preventDefault`, preventing the “default action” of refreshing.

Thatʼs the gist of how HMR works. Of all HMR API I only ever used [`accept`](http://webpack.github.io/docs/hot-module-replacement.html#accept). [This article](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html) gives you a broader look at what HMR is from the point of view of the app, compiler, HMR runtime and modules.

### Why It Is Perfect for React

This is useful to an extent, but you still need to write `accept` handlers, and you wouldnʼt want this kind of code bloat in every module. Moreover, it may be very hard to write correct `accept` code, since youʼd need to write update each moduleʼs dependencies and somehow selectively re-render the app with the new code.

We *could* make this work but only if the UI framework we used offered a deterministic view lifecycle and could re-render certain parts of the app without throwing the DOM or the state away. Oh wait… Here comes React, right?

When an update for a module with a React component comes in, we can patch the prototype of the existing component with new prototype (that has fresh `render` and other methods), and then call `forceUpdate` on all mounted instances. This will keep componentʼs state and, thanks to Reactʼs reconciliation algorithm, apply the minimal set of updates from whatever the previous version of `render` returned.

It would be a chore if we had to do this for every component manually, but thatʼs what [react-hot-loader](https://github.com/gaearon/react-hot-loader) is for! **It handles HMR business for your React components.**

---------

<h2 id="integration">How to Integrate Hot Loading in Your Project</h2>

This part explains how to integrate React live reload into your project.  
**If you donʼt like magic, [read how it works](#not-magic) and [look at the source](https://github.com/gaearon/react-hot-loader).**  

### Porting Your Project to Webpack

Weʼll start by forking [ReactJS Tutorial](https://github.com/reactjs/react-tutorial) app and porting it to use Webpack.  
You may skip this part if your project already uses Webpack.

The [original project](https://github.com/reactjs/react-tutorial) loads a couple of scripts in `index.html`:

{% highlight html %}
<script src="http://fb.me/react-0.10.0.js"></script>
<script src="http://fb.me/JSXTransformer-0.10.0.js"></script>
<script src="http://code.jquery.com/jquery-1.11.1.min.js"></script>
<script src="http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js"></script>
{% endhighlight %}

Although it is not strictly required, we will use NPM versions of React and jQuery instead:

{% highlight sh %}
npm install --save react
npm install --save jquery
{% endhighlight %}

Weʼll leave `Showdown` as a `<script>` tag because its source contains weird `require`s that [choke static tools like Webpack and Browserify](https://github.com/coreyti/showdown/issues/50). This is not a problem for us, because we can still configure Webpack to read this module from a global variable.

As for `JSXTransformer`, we can drop it and let Webpack transform our JSX instead during the compilation.

We need to install Webpack, [dev server](http://webpack.github.io/docs/webpack-dev-server.html) and [JSX loader](https://github.com/petehunt/jsx-loader):

{% highlight sh %}
npm install --save-dev webpack
npm install --save-dev webpack-dev-server
npm install --save-dev jsx-loader
{% endhighlight %}

Next, letʼs create a basic `webpack.config.js` (itʼs just code):

{% highlight js %}
module.exports = {
  // Entry point for static analyzer:
  entry: './scripts/example',

  output: {
    // Where to put build results when doing production builds:
    // (Server doesn't write to the disk, but this is required.)
    path: __dirname,

    // JS filename you're going to use in HTML
    filename: 'bundle.js',

    // Path you're going to use in HTML
    publicPath: '/scripts/'
  },

  resolve: {
    // Allow to omit extensions when requiring these files
    extensions: ['', '.js', '.jsx']
  },

  module: {
    loaders: [
      // Pass *.jsx files through jsx-loader transform
      { test: /\.jsx$/, loader: 'jsx' },
    ]
  },

  externals: {
    // Showdown is not is node_modules,
    // so we tell Webpack to resolve it to a global
    'showdown': 'window.Showdown'
  }
};
{% endhighlight %}

See [Webpack configuration](http://webpack.github.io/docs/configuration.html) for more options.

We told Webpack to run all JSX files through `jsx-loader` so we will now rename `scripts/example.js` to `scripts/example.jsx`. We will also change main `<script>` tag path to match our config `output` settings:

{% highlight html %}
<script src="/scripts/bundle.js"></script>
{% endhighlight %}

There are two things left to do before we can run React tutorial using Webpack.

Firstly, we need to add a few `require`s to `example.jsx`. Previously these libraries were loaded from the global scope, but now Webpack manages them:

{% highlight js %}
var Showdown = require('showdown');
var $ = require('jquery');
var React = require('react');
{% endhighlight %}

Finally, we need to update `server.js` to run `webpack-dev-server`. The tutorial used Express app for mocking an API and serving static files. Since we will use `webpack-dev-server` for serving application files, it would be reasonable to run API on a different port. We will change API to run on port 3001, and use port 3000 for `webpack-dev-server`.

Here are the changes we need to make to `server.js`:

{% highlight diff %}
@@ -1,13 +1,21 @@
 var express = require('express');
 var bodyParser = require('body-parser');
 var app = express();
+var webpack = require('webpack');
+var WebpackDevServer = require('webpack-dev-server');
+var config = require('./webpack.config');

 var comments = [{author: 'Pete Hunt', text: 'Hey there!'}];

-app.use('/', express.static(__dirname));
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({extended: true}));

+app.all('/*', function(req, res, next) {
+  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
+  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
+  next();
+});
+
 app.get('/comments.json', function(req, res) {
   res.setHeader('Content-Type', 'application/json');
   res.send(JSON.stringify(comments));
@@ -19,6 +27,14 @@ app.post('/comments.json', function(req, res) {
   res.send(JSON.stringify(comments));
 });

-app.listen(3000);
+app.listen(3001);

-console.log('Server started: http://localhost:3000/');
+new WebpackDevServer(webpack(config), {
+  publicPath: config.output.publicPath
+}).listen(3000, 'localhost', function (err, result) {
+  if (err) {
+    console.log(err);
+  }
+
+  console.log('Listening at localhost:3000');
+});
{% endhighlight %}

Done! Now run `node server.js` and open `localhost:3000`—the scripts will be watched and assembled by Webpack.
Webpack dev server watches files for changes so you can edit the files and hit Refresh, and changes will appear.

![Webpack dev server running React tutorial](http://cl.ly/image/3w421Q162K13/Screen%20Shot%202014-07-24%20at%2021.10.22%20.png)

Now that our code is served by Webpack, letʼs enable Hot Module Replacement.

### Enabling Hot Module Replacement

Hot Module Replacement is opt-in, we need to change a few configuration options to get it working.

This comes in four parts:

* We need to instruct Webpack to generate HMR partial builds by specifying `HotModuleReplacementPlugin` Webpack plugin;
* We need our bundle to include HMR runtime (`webpack/hot/dev-server`) that knows how to apply hot updates (part of Webpack);
* We need to specify `hot: true` in dev server options so it emits HMR events when files change;
* Because HMR runtime is server-agnostic and doesnʼt know anything about `webpack-dev-server`, we need to also bundle a small script (`webpack-dev-server/client?http://localhost:3000`) that listens to `webpack-dev-server` messages and passes them to HMR runtime.

To reiterate, here is what happens:

<pre>
[file changed] ->
[HotModuleReplacementPlugin] rebuild and prepare updated modules
[webpack-dev-server:3000] tell by socket that update is available
[webpack-dev-server/client] learn by socket that update is available
[webpack/hot/dev-server] apply the update to modules
</pre>

In `server.js`, we need to change `WebpackDevServer` constructor call:

{% highlight diff %}
 new WebpackDevServer(webpack(config), {
-  publicPath: config.output.publicPath
+  publicPath: config.output.publicPath,
+  hot: true
 }).listen(3000, 'localhost', function (err, result) {
{% endhighlight %}

In `webpack.config.js`, we will include HMR runtime and `webpack-dev-server` client code as additional entry points:

{% highlight diff %}
@@ -1,10 +1,18 @@
+var webpack = require('webpack');
+
 module.exports = {
-  entry: './scripts/example',
+  entry: [
+    'webpack-dev-server/client?http://localhost:3000',
+    'webpack/hot/dev-server',
+    './scripts/example'
+  ],
   output: {
     path: __dirname,
     filename: 'example.js',
     publicPath: '/scripts/'
   },
+  plugins: [
+    new webpack.HotModuleReplacementPlugin()
+  ],
   resolve: {
     extensions: ['', '.js', '.jsx']
   },
{% endhighlight %}

Now if you run `node server.js` and edit a file, the app will refresh automatically without having to press F5.  
The reload happens because we donʼt have any HMR handlers in our code yet.

### Using react-hot-loader to live-edit React components

Finally, **[react-hot-loader](https://github.com/gaearon/react-hot-loader)** comes to the rescue. It handles HMR udpates for any JSX file automatically as long as your JSX files export a valid component.

Letʼs install `react-hot-loader` first:

{% highlight sh %}
npm install --save-dev react-hot-loader
{% endhighlight %}

One tiny thing we need to do to our source code is to split components from code that has side-effects (such as rendering the root component).

We will change `example.jsx` to include code with side-effects:

{% highlight js %}
/** @jsx React.DOM */

var CommentBox = require('./CommentBox'),
    React = require('react');

React.renderComponent(
  <CommentBox
    url="http://localhost:3001/comments.json"
    pollInterval={2000} />,
  document.getElementById('content')
);
{% endhighlight %}

and move everything else to `CommentBox.jsx`, with

{% highlight js %}
module.exports = CommentBox;
{% endhighlight %}

at the end of file.

Finally, we will instruct Webpack to use `react-hot-loader` for any JSX file by changing `webpack.config.js`:

{% highlight diff %}
   module: {
     loaders: [
-      { test: /\.jsx$/, loader: 'jsx' },
+      { test: /\.jsx$/, loaders: ['react-hot', 'jsx'] },
     ]
   },
{% endhighlight %}

And this is it! We can now live-edit `CommentBox.jsx` without unmounting components or losing their state.  

---------

## Links

* **[Tutorial fork with live reload on Github](https://github.com/gaearon/react-tutorial-hot)**

* **[react-hot-loader on Github](https://github.com/gaearon/react-hot-loader)**

---------

## Credits

This wouldnʼt be possible without help of several people.
Iʼd like to thank:

* [Pete Hunt](http://github.com/petehunt) for React and dropping by every now and then;
* [Tobias Koppers](http://github.com/sokra) for Webpack, [react-proxy-loader](http://github.com/sokra/react-proxy-loader) and explanations;
* [Johannes Lumpe](http://github.com/johanneslumpe) and [Ben Alpert](http://github.com/spicyj) on `#reactjs` for suggesting to mess with component spec and wrap prototype methods;
* Bret Victor for making me think live editing should be the norm, although he probably hates what people do after watching his videos.

---------

## Footnotes

[^1]: The word “loader” in Webpack terminology [can be confusing](https://github.com/webpack/webpack/issues/182) because not all loaders load something dynamically. Instead think of “loaders” as of transforms that take one module, may change its source code and output one or more modules. Loaders can be chained and are used for everything in Webpack: from [compiling JSX](https://github.com/petehunt/jsx-loader) and [CoffeeScript](https://github.com/webpack/coffee-loader) to [requiring CSS as a module](https://github.com/webpack/css-loader), to [making `require` return a promise](https://github.com/gaearon/promise-loader), to React live reloading that you are reading about.

[^2]: Converting to Webpack from RequireJS or Browserify is straightforward because Webpack supports all module styles (AMD and CommonJS, as well as careless globals with [imports-loader](https://github.com/webpack/imports-loader) and [exports-loader](https://github.com/webpack/exports-loader)), can `watch` with fast incremental updates, compile to a single file or even to several chunks. Everything that RequireJS or Browserify can do, Webpack does better. My only gripe with Webpack is documentation being too dense, but this is being addressed. See [Pete Huntʼs no-bullshit intro to Webpack](https://github.com/petehunt/webpack-howto).
