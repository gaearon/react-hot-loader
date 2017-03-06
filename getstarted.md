---
layout: page
title: Getting Started
---

React Hot Loader is a plugin that allows React components to be live reloaded without the loss of state. It works with Webpack and other bundlers that support both Hot Module Replacement (HMR) and Babel plugins.

If you just want a quick start with a fresh, barebones boilerplate, where everything works out of the box (using Webpack), check out `react-hot-boilerplate`, the official boilerplate:

[https://github.com/gaearon/react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate)

or the new, minimal one:

[https://github.com/wkwiatek/react-hot-loader-minimal-boilerplate](https://github.com/wkwiatek/react-hot-loader-minimal-boilerplate)

## Integrating into your app

What follows is a 3-step guide for integrating React Hot Loader into your current project.

### Step 1 (of 3): Enabling Hot Module Replacement (HMR)

HMR allows us to replace modules in-place without restarting the server. Here's how you can enable it for different bundlers:

#### Webpack

**Option 1: Webpack Dev Server CLI (client-side rendering only)**

The easiest and fastest option to use React Hot Loader with Webpack is to use `webpack-dev-server` with `--hot` CLI option.

```js
  "scripts": {
    "start": "webpack-dev-server --hot"
  },
```

That's it! You can go to the [Step 2](#step-2-of-3-using-hmr-to-replace-the-root-component).

**Option 2: Webpack Dev Server with custom server (client-side rendering only)**

If you're only rendering on the client side but you have to use some custom node server, this is still an easy option.  You can simply copy [`server.js`](https://github.com/gaearon/react-hot-boilerplate/blob/master/server.js){:target="_blank"} from the official boilerplate into your project. The important part of the configuration is that when you create a `new WebpackDevServer`, you need to specify `hot: true` as an option.

Here is `server.js` from the official boilerplate:

```js
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    return console.log(err);
  }

  console.log('Listening at http://localhost:3000/');
});
```

To launch it via `npm start`, add the following script to your [`package.json`](https://github.com/gaearon/react-hot-boilerplate/blob/master/package.json){:target="_blank"}:

```js
  "scripts": {
    "start": "node server.js"
  },
```

In your [`webpack.config.js`](https://github.com/gaearon/react-hot-boilerplate/blob/master/webpack.config.js){:target="_blank"}, you'll need to add the dev server and hot reload server to the `entry` section. Put them in the `entry` array, before your appʼs entry point:

```js
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
    './scripts/index' // Your appʼs entry point
  ]
```

Finally, the Hot Replacement plugin from Webpack has to be included in the `plugins` section of the config. Add `var webpack = require('webpack')` at the top of your Webpack config, then add `new webpack.HotModuleReplacementPlugin()` to the `plugins` section:

```js
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
```

> Note: If you are using the Webpack Dev Server command line interface instead of its Node API, *do not* add this plugin to your config if you use the `--hot` flag. It is mutually exclusive from the `--hot` option.

Check out the boilerplate's [`webpack.config.js`](https://github.com/gaearon/react-hot-boilerplate/blob/master/webpack.config.js) to see it all together.

**Option 3: Express with webpack-dev-middleware (client & server)**

If you are using server-side rendering, the WebpackDevServer above is not enough. Instead, we have to use an Express server with the `webpack-dev-middleware`.  This is a bit more work, but also gives us more control. We need to add this middleware and it's entry point.

XXX TODO

#### Meteor

*   If you're using [webpack:webpack](https://atmospherejs.com/webpack/webpack), you can follow the Webpack instructions, or ask for help in [this](https://forums.meteor.com/t/use-webpack-with-meteor-simply-by-adding-packages-meteor-webpack-1-0-is-out/18819) forum post.

*   Otherwise, for HMR in "native" Meteor, type: `meteor remove ecmascript && meteor add gadicc:ecmascript-hot` or see the [README](https://github.com/gadicc/meteor-hmr#readme) for more details.  There are also some Meteor-specific RHLv3 install instructions [here](https://github.com/gadicc/meteor-hmr/blob/master/docs/React_Hotloading.md).

### Step 2 (of 3): Using HMR to replace the root component

To update components when changes occur, you need to add some code to your main client entry point file.

If your entry point looks like this, where `<RootContainer>` is your app's top-level component:

```js
import React from 'react';
import { render } from 'react-dom';
import RootContainer from './containers/rootContainer.js';

render(<RootContainer />, document.getElementById('react-root'));
```
Add the following code to accept changes to your RootContainer, _or any of it's descendants_:

```js
 if (module.hot) {
   module.hot.accept('./containers/rootContainer.js', () => {
     const NextRootContainer = require('./containers/rootContainer.js').default;
     render(<NextRootContainer />, document.getElementById('react-root'));
   }
 }
```

> *How it works:* When the HMR runtime receives an updated module, it first checks to see if the module knows how to update itself. It then goes up the import/require chain, looking for a parent module that can accept the update.  The added code allows our root component to accept an update from any child component.

Note that, with no further steps, this is enough to hot reload changes to React components, but their internal component state will not be preserved, since a new copy of the component is mounted, and its state is re-initialized.  State that is kept externally in a state store, such as Redux, will obviously not be lost.

#### Step 3 (of 3): Adding React Hot Loader to preserve component state

To preserve *internal component state*, you now need to add `react-hot-loader` to your project.

1.  Install the package:

    ```sh
    $ npm install --save-dev react-hot-loader@next
    ```
1.  Add the package to your config:

    a.  If you use Babel, modify your `.babelrc` to ensure it includes at least:

    ```js
      {
        "plugins": [ "react-hot-loader/babel" ]
      }
    ```
    b. Alternatively, in Webpack, add `react-hot-loader/webpack` to the `loaders` section of your `webpack.config.js`:

    ```js
        module: {
            loaders: [{
                test: /\.js$/,
                loaders: ['react-hot-loader/webpack', 'babel'],
                include: path.join(__dirname, 'src')
            }]
        }
    ```

    > Note: `react-hot-loader/webpack` only works on *exported* components,
    whereas `react-hot-loader/babel` picks up all *top-level variables* in
    your files. As a workaround, with Webpack, you can export all the
    components whose state you want to maintain, even if they're not
    imported anywhere else.

1.  Update your main client entry point:

    a.  Add following line to the top of your main client entry point:

    ```js
    import 'react-hot-loader/patch';
    ```

    > Alternatively, in Webpack, add `react-hot-loader/patch` to the `entry` section of your `webpack.config.js`:

    ```js
      entry: [
        'react-hot-loader/patch', // RHL patch
        './scripts/index' // Your appʼs entry point
      ]
    ```

    b.  Wrap your app's top-level component inside of an **`<AppContainer>`.**

    > `AppContainer` is a component, provided by `react-hot-loader`, that handles hot reloading, as well as error handling.  It also [internally](https://github.com/gaearon/react-hot-loader/blob/next/src/AppContainer.js#L5-L9) handles disabling hot reloading/error handling when running in a production environment, so you no longer have to.

    You need to wrap both instances, e.g. your original mount, and your mount code inside of the `module.hot.accept()` function.  Note that `<AppContainer>` must only wrap a single React component.

    Your main entry point should now look something like this:

    ```js
    import 'react-hot-loader/patch';
    import React from 'react';
    import { render } from 'react-dom';

    import { AppContainer } from 'react-hot-loader';
    import RootContainer from './containers/rootContainer';

    const render = Component => {
      ReactDOM.render(
        <AppContainer>
          <Component />
        </AppContainer>,
        document.getElementById('root')
      );
    }

    render(RootContainer);

    if (module.hot) {
      module.hot.accept('./containers/rootContainer.js', () => {
        const NextRootContainer = require('./containers/rootContainer');
        render(NextRootContainer);
      });
    }
    ```

    c. Webpack 2 has built-in support for ES2015 modules, and you won't need to re-require your app root in module.hot.accept. The example above becomes:

    > Note: To make this work, you'll need to opt out of Babel transpiling ES2015 modules by changing the Babel ES2015 preset to be
    ```
    {
      "presets": [["es2015", { "modules": false }]]
    }
    ```
    or when using `latest` preset then:
    ```
    {
      "presets": [
        ["latest", {
          "es2015": {
            "modules": false
          }
        }]
      ]
    }
    ```

    ```js
    import 'react-hot-loader/patch';
    import React from 'react';
    import ReactDom from 'react-dom';
    import { AppContainer } from 'react-hot-loader';

    import RootContainer from './containers/rootContainer';

    const render = Component => {
      ReactDOM.render(
        <AppContainer>
          <Component />
        </AppContainer>,
        document.getElementById('root')
      );
    }

    render(RootContainer);

    if (module.hot) {
      module.hot.accept('./containers/rootContainer', () => { render(RootContainer) });
    }
    ```


That's it! Happy hot reloading!

### Troubleshooting

If hot reloading doesnʼt work, itʼs usually due to a deviation from the configuration described above. Make sure to compare your setup to <a href="https://github.com/gaearon/react-hot-boilerplate" target="_blank">`react-hot-boilerplate`</a> or <a href="https://github.com/wkwiatek/react-hot-loader-minimal-boilerplate" target="_blank">`react-hot-loader-minimal-boilerplate`</a> and verify that the boilerplate works for you. Look very closely for small typos.

If youʼre stuck, <a href="https://github.com/gaearon/react-hot-loader/issues/new" target="_blank">file an issue</a> or ask for help in <a href="https://gitter.im/gaearon/react-hot-loader" target="_blank">the Gitter room</a>, and weʼll try to figure it out.

In order to improve our documentation, we need your feedback! Feel free to <a href="https://github.com/gaearon/react-hot-loader/issues/new" target="_blank">open an issue</a> for that too!
