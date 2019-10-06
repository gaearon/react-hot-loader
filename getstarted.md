---
layout: page
title: Getting Started
---

React Hot Loader is a plugin that allows React components to be live reloaded without the loss of state. It works with Webpack and other bundlers that support both Hot Module Replacement (HMR) and Babel plugins.

## Install

```
npm install react-hot-loader
```

## Getting started

1\.  Add `react-hot-loader/babel` to your `.babelrc`:

```js
// .babelrc
{
  "plugins": ["react-hot-loader/babel"]
}
```

2\.  Mark your root component as _hot-exported_:

```js
// App.js
import { hot } from 'react-hot-loader/root';
const App = () => <div>Hello World!</div>;
export default hot(App);
```

3\.  Make sure `react-hot-loader` is required before `react` and `react-dom`:

* or `import 'react-hot-loader'` in your main file (before React)
* or prepend your webpack entry point with `react-hot-loader/patch`, for example:
  ```js
  // webpack.config.js
  module.exports = {
    entry: ['react-hot-loader/patch', './src'],
    // ...
  };
  ```

4\.  If you need hooks support, use @hot-loader/react-dom.

## `@hot-loader/react-dom`

[`@hot-loader/react-dom`](https://github.com/hot-loader/react-dom) replaces the "react-dom" package of the same version, but with additional patches to support hot reloading.

There are 2 ways to install it:

1\.  Use **yarn** name resolution, so `@hot-loader/react-dom` would be installed instead of `react-dom`.

```
yarn add react-dom@npm:@hot-loader/react-dom
```

2\.  Use [webpack aliases](https://webpack.js.org/configuration/resolve/#resolvealias).

```
yarn add @hot-loader/react-dom
```

```js
// webpack.config.js
module.exports = {
  // ...
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
};
```

## More documentation

For more detailed documentation, see [README on GitHub](https://github.com/gaearon/react-hot-loader/blob/master/README.md). A troubleshooting guide documenting common setup issues [can be found here](https://github.com/gaearon/react-hot-loader/blob/master/docs/Troubleshooting.md).

Contributions to the project [are also welcome](https://github.com/gaearon/react-hot-loader/blob/master/CONTRIBUTING.md)!
