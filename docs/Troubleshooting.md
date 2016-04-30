This file serves as a repository of common problems setting up React Hot Loader, and solutions to them.
Know a problem? Feel free to send a PR with edits.

### What Should It Look Like?

#### When the page loads

![](http://i.imgur.com/nuSa1i3.png)

#### When you save a file

![](http://i.imgur.com/oOc0ikV.png)

If you don't see some of the messages, or some of the requests, or if some of the requests fail, this is a symptom of an incorrect configuration. Comparing your setup with [React Hot Boilerplate](https://github.com/gaearon/react-hot-boilerplate) may help you find the mistake.

---------

### Can't Build

#### Cannot resolve 'file' or 'directory' `react/lib/ReactMount`

If you're using a precompiled React instead of `react` npm package, React Hot Loader configuration will need a few tweaks. See [Usage with External React](https://github.com/gaearon/react-hot-loader/blob/master/docs/README.md#usage-with-external-react).

Make sure you have `'.js'` in `resolve.extensions` section of Webpack config, or Webpack won't be able to find any JS files without explicitly specifying extension in `require`.

#### SyntaxError: 'import' and 'export' may only appear at the top level

If you're using React Hot Loader together with [Babel](https://babeljs.io/) (ex 6to5), make sure React Hot Loader stays **to the left** of Babel in `loaders` array in Webpack config:

```js
  { test: /\.jsx?$/, loaders: ['react-hot', 'babel'], include: path.join(__dirname, 'src') }
```

Webpack applies `loaders` right to left, and we need to feed Babel's *output* to React Hot Loader, not vice versa.

#### Error: Invalid path './' (or similar)

If you're using a relative output path in your Webpack config, wrap it in a call to `path.resolve()`:

```js
var path = require('path');

module.exports = {
  ...,
  output: {
    path: path.resolve('./my-relative-path'),
    ...
  }
};
```

If you used WebpackDevServer CLI mode and after switching to Node it crashes with `Error: Invalid path ''`, you probably didn't have `path` specified in `output` at all. You can just put `path: __dirname` there, as it won't matter for development config.

### Module not found: Error: Cannot resolve module 'react-hot'

Most likely you used `npm link` to use a development version of a package in a different folder, and React Hot Loader processed it by mistake. You should use [`include` in loader configuration](https://github.com/gaearon/react-hot-boilerplate/blob/master/webpack.config.js#L27) to only opt-in your app's files to processing.

---------

### Page Throws an Error

#### Uncaught TypeError: Cannot read property 'NODE_ENV' of undefined
#### [socket.io] Cannot use 'in' operator to search for 'document' in undefined

Make sure you have `exclude: /node_modules/` or, better, `include: path.join(__dirname, 'src')` (path depends on your application) in loader configuration [just like on this line](https://github.com/gaearon/react-hot-boilerplate/blob/fbdbd93956241320bc3960d350c4dd0030cc6e84/webpack.config.js#L27). You never need to process `node_modules` with React Hot Loader. If you use other loaders such as `jsx?harmony` or `babel`, most likely they **also** need to have `include` specified.

---------

### Can't Hot Reload

Generally, the best way to fix this class of errors is to compare your setup to [React Hot Boilerplate](https://github.com/gaearon/react-hot-boilerplate) very carefully and see what's different.

#### Try WebpackDevServer Node Interface Instead of CLI!

WebpackDevServer CLI mode [behaves slightly differently](https://github.com/webpack/webpack-dev-server/issues/106) from its Node API. When in doubt, I suggest you use Node API like [React Hot Boilerplate does](https://github.com/gaearon/react-hot-boilerplate/blob/master/server.js).

#### Uncaught RangeError: Maximum call stack size exceeded

When using WebpackDevServer CLI flag `--hot`, the plugin `new HotModuleReplacementPlugin()` should not be used and vice versa, they are mutually exclusive but the desired effect will work with any of them.

#### No 'Access-Control-Allow-Origin' header is present on the requested resource.

If you're trying to access Webpack Dev Server from a URL served on another port, you may try:

* Changing `WebpackDevServer` options to include CORS header:

```js
new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  headers: { 'Access-Control-Allow-Origin': '*' }
})
```

* Making sure that `webpack-dev-server` **client host and port** in `webpack.config.js` matches those of your development server:

```js
entry: [
  'webpack-dev-server/client?http://localhost:3000', // WebpackDevServer host and port
  'webpack/hot/only-dev-server',
  './src/app'
]
```


#### The following modules couldn't be hot updated: (They would need a full reload!)

**If you get this warning when editing a root component**, this may be because you don't export anything from it, and call `React.render` from there. Put your root component in a separate file (e.g. `App.jsx`) and `require` it from `index.js` where you call `React.render`.

You also get this warning in v1.x if you write your root component as [stateless plain function](http://facebook.github.io/react/docs/reusable-components.html#stateless-functions) instead of using `React.Component`. This problem is already solved completely in the upcoming [v3.x](https://github.com/gaearon/react-hot-boilerplate/pull/61).

This warning may also appear **if you edit some non-component file** which is `require`d from files other than components. This means hot update bubbled up, but the app couldn't handle it. This is normal! Just refresh.

If you get this warning **together with a 404 for `hot-update.json` file**, you're probably using an ancient version of `webpack-dev-server` (just update it).

#### I see “[WDS] Hot Module Replacement enabled” but nothing happens when I edit `App.js`

If you're running Node 0.11.13, you might want to try updating to 0.12. Some people reported this helped solve this problem. Also **make sure that your `require`s have the same filename casing as the files.** Having `App.js` and doing `require('app')` might trip the watcher on some systems.

OS X also has a rarely-occuring bug that causes some folders to get 'broken' with regards to file system change monitoring. Here are some suggested [fixes](http://feedback.livereload.com/knowledgebase/articles/86239).

#### I see “[HMR] Nothing hot updated.” and nothing happens when I edit `App.js`

If you have several entry points in `entry` configuration option, make sure `webpack/hot/only-dev-server` **is in each of them:**

```js
  entry: {
    app: ['./src/app', 'webpack/hot/only-dev-server'],
    editor: ['./src/editor', 'webpack/hot/only-dev-server'],
    ...,
    client: 'webpack-dev-server/client?http://localhost:3000'
  }
```

You will have to include "client.js" in your host page for the hot updates to work. For example:

```html
  <script src="/static/bundle-client.js"></script>
  <script src="/static/bundle-app.js"></script>
  <script src="/static/bundle-entry.js"></script>
```

The entry points that don't have `webpack/hot/only-dev-server` (or `webpack/hot/dev-server` if you fancy occasional reloads) won't know how to apply hot updates.

#### Syntax error: Unexpected token <

If you combine WebpackDevServer with an existing server like Express and get this error message on hot updates, it is because Webpack is configured to request hot updates *from the current hostname*. So if your Express server is on `8000` and `publicPath` in Webpack config is `/build/`, it will request hot updates from `http://localhost:8000/build/`, which in your case is served by Express. Instead, you need to set `publicPath` to point to the port where WebpackDevServer is running. For example, it could be `http://localhost:9000/build/`.

#### Not enough watchers

Verify that if you have enough available watchers in your system. If this value is too low, the file watcher in Webpack won't recognize the changes:

```
cat /proc/sys/fs/inotify/max_user_watches
```

Arch users, add `fs.inotify.max_user_watches=524288` to `/etc/sysctl.d/99-sysctl.conf` and then execute `sysctl --system`. Ubuntu users (and possibly others): `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`.

#### 404 errors for `hot-update.json` files

First, make sure you have recent versions of Webpack and Webpack Dev Server (>= 1.7 is fine). Earlier versions use 404 code when no updates were available, so it wasn't technically an error.

Now, take a look at the path where they are requested. Webpack uses `output.publicPath` from Webpack config to determine this path. If you forget to specify it, Webpack will request updates from a relative path to the current one, so any client-side routing will break it.

Normally you want it to be `'/'` if you're serving scripts from root, something like `'/scripts/'` if you have a virtual path for scripts, and something like `'http://localhost:port/scripts/` if you're using Webpack only for scripts but have another primary server like Express. **This config variable must also match `publicPath` option specified when creating `WebpackDevServer` instance.** [Take a look at React Hot Boilerplate](https://github.com/gaearon/react-hot-boilerplate/blob/master/server.js#L6) to get an idea.

---------------

### Misc

#### It's slowing down my build!

Make sure you have `include` limited to your app's modules in loader configuration [just like on this line](https://github.com/gaearon/react-hot-boilerplate/blob/fbdbd93956241320bc3960d350c4dd0030cc6e84/webpack.config.js#L27). You never need to process `node_modules` with React Hot Loader.

#### My bundle is so large!

Make sure you have separate configs for development and production. You don't need `react-hot` in `loaders` or `webpack-dev-server/client` or `webpack/hot/only-dev-server` in production config. They are only for development. For easier maintenance, you can set an environment variable before invoking Webpack and read it in config.

Also make sure you have these plugins in production config:

```js
// removes a lot of debugging code in React
new webpack.DefinePlugin({
  'process.env': {
    'NODE_ENV': JSON.stringify('production')
  }
}),
// keeps hashes consistent between compilations
new webpack.optimize.OccurenceOrderPlugin(),
// minifies your code
new webpack.optimize.UglifyJsPlugin({
  compressor: {
    warnings: false
  }
})
```

Oh, and don't forget to remove `devtool: 'eval'` from a production config. Otherwise Uglify won't uglify anything at all.

#### I can access my Single Page App (SPA) only via `/` on refresh

The problem is that by default **WebpackDevServer** doesn't deal with HTML5 History correctly and the server won't route the url as it should. You can fix this issue by setting `historyApiFallback: true`. Here's a full example:

```js
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('./webpack.config');

var port = 4000;
var ip = '0.0.0.0';

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  historyApiFallback: true,
}).listen(port, ip, function (err) {
  if(err) {
    return console.log(err);
  }

  console.log('Listening at ' + ip + ':' + port);
});
```

After this you should be able to access your SPA via any url that has been defined in it.
