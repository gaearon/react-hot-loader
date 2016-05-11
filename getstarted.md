---
layout: page
title: Get Started
---

React Hot Loader is a plugin that allows instantaneous live refresh, without losing state, while editing React components.

It works with Webpack and other bundlers that support both Hot Module Replacement (HMR) and Babel plugins.

## Boilerplate Example

What follows is a 3-step guide to integrating React Hot Loader into your current project.  If you just want a quick start with a fresh app with everything working out the box (using webpack), check out the boilerplate:

[https://github.com/gaearon/react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate)

XXX pending [react-hot-boilerplate/pull/61](https://github.com/gaearon/react-hot-boilerplate/pull/61), until then, at [react-hot-boilerplate/tree/next](https://github.com/gaearon/react-hot-boilerplate/tree/next)

## Integrating into your own App

### Step 1/3: Enabling Hot Module Replacement (HMR)

HMR allows us to replace modules in-place without restarting the server. Here's how you can enable it for different bundlers:

#### Webpack

**Option 1: WebpackDevServer (client only)**

If you're only rendering on the client, this is the easier option and quicker to setup.  The key aspect of this configuration is that when creating a `new WebpackDevServer`, you need to specify `hot: true` as an option. For example, you can add an entirely new file called `server.js`, and simply include the [server provided in the boilerplate](https://github.com/gaearon/react-hot-boilerplate/blob/master/server.js){:target="_blank"}.

You can also edit [`package.json`](https://github.com/gaearon/react-hot-boilerplate/blob/master/package.json){:target="_blank"} to call the Webpack server on `npm start`:

```js
  "scripts": {
    "start": "node server.js"
  },
```

In your [`webpack.config.js`](https://github.com/gaearon/react-hot-boilerplate/blob/master/webpack.config.js){:target="_blank"}, configure the `entry` to include the dev server and the hot reloading server. Put them in array before your appʼs entry point:

```js
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
    './scripts/index' // Your appʼs entry point
  ]
```

Finally, the Hot Replacement plugin from Webpack has to be included in the `plugins` section of the config. If you have not used Webpack plugins before, donʼt forget to add `var webpack = require('webpack');` at the top of your config. Then just add `new webpack.HotModuleReplacementPlugin()` to the `plugins` section:

```js
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
```

>Note: If you are using Webpack Dev Server command line interface instead of its Node API, and you specify `--hot` mode, *don't* add this plugin. It is mutually exclusive with the `--hot` option.

**Option 2: Express with webpack-dev-middleware (client & server)**

If you are using server-side rendering, the WebpackDevServer above is not enough. Instead, we have to use an Express server with the `webpack-dev-middleware`.  This is a bit more work, but also gives us more control. We need to add this middleware and it's entry point.

XXX TODO

#### Browserify

If you have this setup working, please consider submitting instructions as a PR.

#### Meteor

*   If you're using [webpack:webpack](https://atmospherejs.com/webpack/webpack), you can follow the webpack instructions, or ask for help in [this](https://forums.meteor.com/t/use-webpack-with-meteor-simply-by-adding-packages-meteor-webpack-1-0-is-out/18819) forum post.

*   Otherwise, for HMR in "native" Meteor, type: `meteor remove ecmascript && meteor add gadicc:ecmascript-hot` or see the [README](https://github.com/gadicc/meteor-hmr#readme) for more details.  There are also some Meteor-specific RHLv3 install instructions [here](https://github.com/gadicc/meteor-hmr/blob/master/docs/React_Hotloading.md).

### Step 2/3: Using HMR to replace the root component

When the HMR runtime receives an updated module, it first checks to see if the module knows how to update itself, and then ascends the import/require chain, looking for a parent module that can accept the update.  We want our root component to be able to accept an update from any child component.

If your client entry point looks like this:

```js
import React from 'react';
import { render } from 'react-dom';
import RootContainer from './containers/rootContainer.js';

render(<RootContainer />, document.elementById('react-root'));
```
you would add the following code to accept changes to RootContainer _or any of it's descendants_.

```js
 if (module.hot) {
   module.hot.accept('./containers/rootContainer.js', () => {
     const NextRootContainer = require('./containers/rootContainer.js').default;
     render(<NextRootContainer />, document.elementById('react-root'));
   }
 }
```
Note, with no further steps, this enough to hotload changes to React components, but *component state* will not be preserved.  If you externalize all your state in a state store, like Redux, this might be enough.

#### Step 3/3: Adding React Hot Loader to preserve state

The final step adds `react-hot-loader` to our project to preserve *component state* across hot loads.

1.  Install the package:

    ```sh
    $ npm install --save-dev react-hot-loader
    ```
1.  Add the package to your config.

    a.  If you use Babel, modify your `.babelrc` to ensure it includes at least:

    ```js
      {
        "plugins": [ "react-hot-loader/babel" ]
      }
    ```
    b. Alternatively, in Webpack, add `react-hot-loader/webpack` to the **loaders** section of your `webpackConfig.js`:

    ```js
        module: {
            loaders: [{
                test: /\.js$/,
                loaders: ['react-hot-loader/webpack', 'babel'],
                include: path.join(__dirname, 'src')
            }]
        }
    ```

    NB: `react-hot-loader/webpack` only works on *exported* components,
    whereas `react-hot-loader/babel` picks up all *top-level variables* in
    your files.

    As a workaround, with Webpack, you can export all the
    components whose state you want to maintain, even if they're not
    imported anywhere else.

1.  Add following line to the top of your main entry point:

    ```js
    import 'react-hot-loader/patch';
    ```

1.  Wrap your `<RootContainer/>` inside of an `<AppContainer>`:

    ```js
    import { AppContainer } from 'react-hot-loader';
    import RootContainer from './containers/rootContainer.js';

    render((
        <AppContainer>
            <RootContainer />
        </AppContainer>
    ), document.getElementById('react-root'));
    ```  

    You should do this for both instances, e.g. your original mount and your mount code inside of the `module.hot.accept()` function.  `<AppContainer>` must wrap only a single React component.

That's it!

### Putting it all together

If you've gotten this far - you're almost done! But before showing you what your app's
main entry point might look like, let's clarify a few things.

`AppContainer`

> `AppContainer` is a component provided by *this* library (`react-hot-loader`). It serves to
wrap your entire app, in order to provide hot reloading goodness!

`RootContainer`

> `RootContainer` represents your application's top-level component, prior
to implementing the `AppContainer` mentioned above. Keep in mind that this can be substituted
for an existing wrapper/parent component.

Your application's main entry point might look like the code presented below. Notice that
we are targeting and subsequently rendering into a particular DOM element's id (conveniently named `react-root`).

```js
import 'react-hot-loader/patch';
import React from 'react';
import { render } from 'react-dom';
// See notes above re: AppContainer and RootContainer
import { AppContainer } from 'react-hot-loader'
import RootContainer from './containers/rootContainer.js';

render((
  <AppContainer>
    <RootContainer />
  </AppContainer>
), document.getElementById('react-root'));

if (module.hot) {
  module.hot.accept('./containers/rootContainer.js', () => {
    const NextRootContainer = require('./containers/rootContainer.js');

    render((
      <AppContainer>
        <NextRootContainer />
      </AppContainer>
    ), document.getElementById('react-root'));
  })
}
```

### Troubleshooting

If hot reloading doesnʼt work, itʼs usually due to a deviation from the configuration described above. Make sure to compare your setup to <a href="https://github.com/gaearon/react-hot-boilerplate" target="_blank">`react-hot-boilerplate`</a> and verify that the boilerplate works for you.

If youʼre stuck, <a href="https://github.com/gaearon/react-hot-loader/issues/new" target="_blank">file an issue</a> or ask for help in <a href="https://gitter.im/gaearon/react-hot-loader" target="_blank">the Gitter room</a>, and weʼll try to figure it out.

Happy hot reloading!
