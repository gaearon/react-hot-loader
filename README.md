# React Hot Loader

[![Build Status][build-badge]][build] [![version][version-badge]][package]
[![Code Coverage][coverage-badge]][coverage]
[![MIT License][license-badge]][license]

[![PRs Welcome][prs-badge]][prs] [![Chat][chat-badge]][chat]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]

Tweak React components in real time ⚛️⚡️

Watch
**[Dan Abramov's talk on Hot Reloading with Time Travel](https://www.youtube.com/watch?v=xsSnOQynTHs).**

## Install

```
npm install react-hot-loader@next
```

> Note: You can safely install react-hot-loader as a regular dependency instead
> of a dev dependency as it automatically ensures it is not executed in
> production and the footprint is minimal.

## Getting started

1. Add `react-hot-loader/babel` to your `.babelrc`:

```js
// .babelrc
{
  "plugins": ["react-hot-loader/babel"]
}
```

> Note: use `.compilerc` in case of Electron

2. Mark your root component as _hot-exported_:

```js
// ./containers/App.js
import React from 'react'
import { hot } from 'react-hot-loader'

const App = () => <div>Hello World!</div>

export default hot(module)(App)
```

Do not use `hot` if you are using **parcel** bundler. It was designed for webpack.

`Hot` accepts only React Component (Stateful or Stateless), resulting the `HotExported` variant of it.
The `hot` function will setup current module to _self-accept_ itself on reload, and will **ignore** all the changes, made for non-React components.
You may mark as much modules as you want. But `HotExportedComponent` **should be the only used export** of a _hot_-module.

> Note: Please note how often we have used `exported` keyword. `hot` is for exports.

> Note: does nothing in production mode, just passes App through.

3. [Run Webpack with Hot Module Replacement](https://webpack.js.org/guides/hot-module-replacement/#enabling-hmr):

```sh
webpack-dev-server --hot
```

## Recipes

### Migrating from [create-react-app](https://github.com/facebookincubator/create-react-app)

1. Run `npm run eject`
2. Install React Hot Loader (`npm install --save-dev react-hot-loader`)
3. In `config/webpack.config.dev.js`, add `'react-hot-loader/babel'` to Babel
   loader configuration. The loader should now look like:

```js
  {
    test: /\.(js|jsx)$/,
    include: paths.appSrc,
    loader: require.resolve('babel-loader'),
    options: {
      // This is a feature of `babel-loader` for Webpack (not Babel itself).
      // It enables caching results in ./node_modules/.cache/babel-loader/
      // directory for faster rebuilds.
      cacheDirectory: true,
      plugins: ['react-hot-loader/babel'],
    },
  }
```

4. Mark your App (`src/index.js`) as _hot-exported_:

```js
// ./containers/App.js
import React from 'react'
import { hot } from 'react-hot-loader'

const App = () => <div>Hello World!</div>

export default hot(module)(App)
```

### Migrating from [create-react-app](https://github.com/facebookincubator/create-react-app) without ejecting

Users [reports](https://github.com/gaearon/react-hot-loader/pull/729#issuecomment-354097936), that it is possible to use [react-app-rewire-hot-loader](https://github.com/cdharris/react-app-rewire-hot-loader) to setup React-hot-loader without ejecting.
Follow [these code examples](https://github.com/Grimones/cra-rhl/commit/4ed74af2dc649301695f67df05a12f210fb7820c) to repeat the approach.

### TypeScript

When using TypeScript, Babel is not required, but RHL will not work without it.
Just add babel-loader into your webpack configuration, with RHL-only config.

```js
{
  test: /\.tsx?$/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        babelrc: true,
        plugins: ['react-hot-loader/babel'],
      },
    },
    'ts-loader', // (or awesome-typescript-loader)
  ],
}
```

### Parcel Bundler

Parcel's HRM is a bit different.

* Do not use `hot` (v4) to make Components hot-reloadable.
* Use `AppContainer` + `module.hot.accept` (v3), follow the version 3 guide lines.

Do the same for any other bundler or framework. `hot` is not a silver bullet. Sometimes it may break the stuff.
If something is not working (absolutely) - remove the `hot`.

### Electron

To enable HRM on webpack, just enable it

```js
enableLiveReload({ strategy: 'react-hmr' })
```

Example - https://github.com/rllola/hmr-example-issue-2/blob/master/src/index.js

### Source Maps

If you use `devtool: 'source-map'` (or its equivalent), source maps will be
emitted to hide hot reloading code.

Source maps slow down your project. Use `devtool: 'eval'` for best build
performance.

Hot reloading code is just one line in the beginning and one line in the end of
each module so you might not need source maps at all.

## React Native

React Native
**[supports hot reloading natively](https://facebook.github.io/react-native/blog/2016/03/24/introducing-hot-reloading.html)**
as of version 0.22.  

Using React Hot Loader with React Native can cause unexpected issues (see #824) and is not recommended.

### Code Splitting

As long most of modern react-component-loader
([loadable-components](https://github.com/smooth-code/loadable-components/),
[react-loadable](https://github.com/thejameskyle/react-loadable), and so on)
does not, and should not support RHL, just mark export of the imported component as
`hotExported`.

Example using
[loadable-components](https://github.com/smooth-code/loadable-components/):

```js
// AsyncHello.js
import loadable from 'loadable-components'
const AsyncHello = loadable(() => import('./Hello.js'))

// Hello.js
import { hot } from 'react-hot-loader'
const Hello = () => 'Hello'
export default hot(module)(Hello) // <-- the only change to do
```

### Checking Element `type`s

Because React Hot Loader creates proxied versions of your components, comparing
reference types of elements won't work:

```js
const element = <Component />
console.log(element.type === Component) // false
```

React Hot Loader exposes a function `areComponentsEqual` to make it possible:

```js
import { areComponentsEqual } from 'react-hot-loader'
const element = <Component />
areComponentsEqual(element.type, Component) // true
```

### Webpack ExtractTextPlugin & CommonModulePlugin

Webpack ExtractTextPlugin is not compatible with these two plugins. The solution is simple, disable them in development:

```js
// Example for ExtractTextPlugin
new ExtractTextPlugin({
  filename: 'styles/[name].[contenthash].css',
  disable: NODE_ENV !== 'production',
})
```

## Migrating from v3

### AppContainer vs hot

Prior v4 the right way to setup React Hot Loader was to wrap your Application
with `AppContainer`, set setup module acceptance by yourself. This approach is
still valid but only for advanced use cases, prefer using `hot` helper.

**React Hot Loader v3:**

```js
// App.js
import React from 'react'

const App = () => <div>Hello world!</div>

export default App
```

```js
// main.js
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './containers/App'

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root'),
  )
}

render(App)

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./containers/App', () => {
    // if you are using harmony modules ({modules:false})
    render(App)
    // in all other cases - re-require App manually
    render(require('./containers/App'))
  })
}
```

**React Hot Loader v4:**

```js
// App.js
import React from 'react'
import { hot } from 'react-hot-loader'

const App = () => <div>Hello world!</div>

export default hot(module)(App)
```

```js
// main.js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './containers/App'

ReactDOM.render(<App />, document.getElementById('root'))
```

### No patch required

Code is automatically patched, you can safely remove `react-hot-loader/patch`
from your Webpack config.

### Error reporter is gone

React supports error handling out of the box since v16 using `componentDidCatch`. You can create your own [Error Boundary](https://reactjs.org/docs/error-boundaries.html#introducing-error-boundaries) and install it after `hot` has been applied:

```js
import React from 'react'
import { hot } from 'react-hot-loader'
import ErrorBoundary from './ErrorBoundary'

const App = () => (
  <ErrorBoundary>
    <div>Hello world!</div>
  </ErrorBoundary>
)

export default hot(module)(App)
```

## Known limitations and side effects

### The original class got updated

On code replace you are replacing the old code by a new one. You should not use
the old code, as thus allow RHL to safely modify it. See
[`react-stand-in`](https://github.com/gaearon/react-hot-loader/tree/next/packages/react-stand-in)
for more details.

### New Components keep executing the old code

There is no way to hot-update constructor code, as result even new components
will be born as the first ones, and then grow into the last ones. See
[`react-stand-in`](https://github.com/gaearon/react-hot-loader/tree/next/packages/react-stand-in)
for more details.

## Troubleshooting

If it doesn't work, in 99% cases it's a configuration issue. A missing option, a
wrong path or port. Webpack is very strict about configuration, and the best way
to find out what's wrong is to compare your project to an already working setup,
check out
**[examples](https://github.com/gaearon/react-hot-loader/tree/next/examples)**,
bit by bit.

If something doesn't work, in 99% cases it's an issue with your code - Component
doesn't got registered, due to HOC or Decorator around it, which making it
invisible to Babel plugin, or Webpack loader.

We're also gathering
**[Troubleshooting Recipes](https://github.com/gaearon/react-hot-loader/blob/next/docs/Troubleshooting.md)**
so send a PR if you have a lesson to share!

### Switch into debug mode

Debug mode adds additional warnings and can tells you why React Hot Loader is
not working properly in your application.

```js
import { setConfig } from 'react-hot-loader'
setConfig({ logLevel: 'debug' })
```

## License

MIT

[build-badge]: https://img.shields.io/travis/gaearon/react-hot-loader.svg?style=flat-square
[build]: https://travis-ci.org/gaearon/react-hot-loader
[coverage-badge]: https://img.shields.io/codecov/c/github/gaearon/react-hot-loader.svg?style=flat-square
[coverage]: https://codecov.io/github/gaearon/react-hot-loader
[version-badge]: https://img.shields.io/npm/v/react-hot-loader.svg?style=flat-square
[package]: https://www.npmjs.com/package/react-hot-loader
[license-badge]: https://img.shields.io/npm/l/react-hot-loader.svg?style=flat-square
[license]: https://github.com/gaearon/react-hot-loader/blob/next/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[chat]: https://gitter.im/gaearon/react-hot-loader
[chat-badge]: https://img.shields.io/gitter/room/gaearon/react-hot-loader.svg?style=flat-square
[github-watch-badge]: https://img.shields.io/github/watchers/gaearon/react-hot-loader.svg?style=social
[github-watch]: https://github.com/gaearon/react-hot-loader/watchers
[github-star-badge]: https://img.shields.io/github/stars/gaearon/react-hot-loader.svg?style=social
[github-star]: https://github.com/gaearon/react-hot-loader/stargazers
