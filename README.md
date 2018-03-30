# React Hot Loader

[![Build Status][build-badge]][build] [![version][version-badge]][package]
[![Code Coverage][coverage-badge]][coverage]
[![MIT License][license-badge]][license]

[![PRs Welcome][prs-badge]][prs] [![Chat][chat-badge]][chat]
[![Backers on Open Collective][oc-backer-badge]](#backers)
[![Sponsors on Open Collective][oc-sponsor-badge]](#sponsors)

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]

Tweak React components in real time ⚛️⚡️

Watch
**[Dan Abramov's talk on Hot Reloading with Time Travel](https://www.youtube.com/watch?v=xsSnOQynTHs).**

## Install

```
npm install react-hot-loader
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

2. Mark your root component as _hot-exported_:

```js
// App.js
import React from 'react'
import { hot } from 'react-hot-loader'

const App = () => <div>Hello World!</div>

export default hot(module)(App)
```

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

Users [report](https://github.com/gaearon/react-hot-loader/pull/729#issuecomment-354097936), that it is possible to use [react-app-rewire-hot-loader](https://github.com/cdharris/react-app-rewire-hot-loader) to setup React-hot-loader without ejecting.
Follow [these code examples](https://github.com/Grimones/cra-rhl/commit/4ed74af2dc649301695f67df05a12f210fb7820c) to repeat the approach.

### TypeScript

When using TypeScript, Babel is not required, but React Hot Loader will not work (properly) without it.
Just add `babel-loader` into your Webpack configuration, with React Hot Loader plugin.

There is 2 different ways to do it.

##### Add babel AFTER typescript.

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

In this case you have to modify your `tsconfig.json`, and compile to ES6 mode, as long React-Hot-Loader babel plugin could not understand ES5 code.

```json
// tsconfig.json
{
  "module": "commonjs",
  "target": "es6"
}
```

##### Add babel BEFORE typescript (preferred)

```js
{
  test: /\.tsx?$/,
  use: [
    'ts-loader', // (or awesome-typescript-loader)
    {
      loader: 'babel-loader',
      options: {
        plugins: [
          '@babel/plugin-syntax-typescript',
          '@babel/plugin-syntax-decorators',
          '@babel/plugin-syntax-jsx',
          'react-hot-loader/babel',
        ],
      },
    }
  ],
}
```

In this case you can compile to ES5. More about [typescript and react-hot-loader](https://github.com/gaearon/react-hot-loader/issues/884)

We also have a [full example running TypeScript + React Hot Loader](https://github.com/gaearon/react-hot-loader/tree/master/examples/typescript).

### Parcel

Parcel supports Hot Module Reloading out of the box, just follow step 1 and 2 of [Getting Started](https://github.com/gaearon/react-hot-loader/tree/master#getting-started).

We also have a [full example running Parcel + React Hot Loader](https://github.com/gaearon/react-hot-loader/tree/master/examples/parcel).

### Electron

1. Add `react-hot-loader/babel` to your `.compilerc`:

```js
// .compilerc
{
  "plugins": ["react-hot-loader/babel"]
}
```

2. Enable Live Reload in the project

```js
enableLiveReload({ strategy: 'react-hmr' })
```

See a [complete example](https://github.com/rllola/hmr-example-issue-2/blob/master/src/index.js).

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

Most of modern React component-loader libraries ([loadable-components](https://github.com/smooth-code/loadable-components/),
[react-loadable](https://github.com/thejameskyle/react-loadable)...) are compatible with React Hot Loader.

You have to mark your "loaded components" as _hot-exported_.

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

### Webpack ExtractTextPlugin

Webpack ExtractTextPlugin is not compatible with React Hot Loader. Please disable it in development:

```js
new ExtractTextPlugin({
  filename: 'styles/[name].[contenthash].css',
  disable: NODE_ENV !== 'production',
})
```

## API

### `hot(module, options)`

Mark a component as hot.

```js
import { hot } from 'react-hot-loader'

const App = () => 'Hello World!'

export default hot(module)(App)
```

### `AppContainer`

Mark application as hot reloadable. Prefer using `hot` helper.

```js
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

### areComponentsEqual(Component1, Component2)

Test if two components have the same type.

```js
import { areComponentsEqual } from 'react-hot-loader'
import Component1 from './Component1'
import Component2 from './Component2'

areComponentsEqual(Component1, Component2) // true or false
```

### setConfig(config)

Set a new configuration for React Hot Loader.

Available options are:

* `logLevel`: specify log level, default to `"error"`, available values are: `['debug', 'log', 'warn', 'error']`

```js
import { setConfig } from 'react-hot-loader'

setConfig({ logLevel: 'debug' })
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

### Not about `hot`

`hot` accepts only React Component (Stateful or Stateless), resulting the `HotExported` variant of it.
The `hot` function will setup current module to _self-accept_ itself on reload, and will **ignore** all the changes, made for non-React components.
You may mark as much modules as you want. But `HotExportedComponent` **should be the only used export** of a _hot_-module.

> Note: Please note how often we have used `exported` keyword. `hot` is for exports.

> Note: does nothing in production mode, just passes App through.

### New Components keep executing the old code

There is no way to hot-update constructor code, as result even new components
will be born as the first ones, and then grow into the last ones. As of today, this issue cannot be solved.

## Troubleshooting

If it doesn't work, in 99% cases it's a configuration issue. A missing option, a
wrong path or port. Webpack is very strict about configuration, and the best way
to find out what's wrong is to compare your project to an already working setup,
check out
**[examples](https://github.com/gaearon/react-hot-loader/tree/master/examples)**,
bit by bit.

If something doesn't work, in 99% cases it's an issue with your code - Component
doesn't got registered, due to HOC or Decorator around it, which making it
invisible to Babel plugin, or Webpack loader.

We're also gathering
**[Troubleshooting Recipes](https://github.com/gaearon/react-hot-loader/blob/master/docs/Troubleshooting.md)**
so send a PR if you have a lesson to share!

### Switch into debug mode

Debug mode adds additional warnings and can tells you why React Hot Loader is
not working properly in your application.

```js
import { setConfig } from 'react-hot-loader'
setConfig({ logLevel: 'debug' })
```

## Contributors

This project exists thanks to all the people who contribute. [Contribute](CONTRIBUTING.md).
[![contributors][oc-contributors-img]]('graphs/contributors')

## Backers

Thank you to all our backers! 🙏 [Become a backer][oc-backer-link]
[![backers][oc-backer-img]][oc-backer-link]

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [Become a sponsor][oc-sponsor-link]

<a href="https://opencollective.com/react-hot-loader/sponsor/0/website" target="_blank"><img src="https://opencollective.com/react-hot-loader/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/react-hot-loader/sponsor/1/website" target="_blank"><img src="https://opencollective.com/react-hot-loader/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/react-hot-loader/sponsor/2/website" target="_blank"><img src="https://opencollective.com/react-hot-loader/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/react-hot-loader/sponsor/3/website" target="_blank"><img src="https://opencollective.com/react-hot-loader/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/react-hot-loader/sponsor/4/website" target="_blank"><img src="https://opencollective.com/react-hot-loader/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/react-hot-loader/sponsor/5/website" target="_blank"><img src="https://opencollective.com/react-hot-loader/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/react-hot-loader/sponsor/6/website" target="_blank"><img src="https://opencollective.com/react-hot-loader/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/react-hot-loader/sponsor/7/website" target="_blank"><img src="https://opencollective.com/react-hot-loader/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/react-hot-loader/sponsor/8/website" target="_blank"><img src="https://opencollective.com/react-hot-loader/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/react-hot-loader/sponsor/9/website" target="_blank"><img src="https://opencollective.com/react-hot-loader/sponsor/9/avatar.svg"></a>

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
[oc-backer-badge]: https://opencollective.com/react-hot-loader/backers/badge.svg
[oc-sponsor-badge]: https://opencollective.com/react-hot-loader/sponsors/badge.svg
[oc-contributors-img]: https://opencollective.com/react-hot-loader/contributors.svg?width=890&button=false
[oc-backer-img]: https://opencollective.com/react-hot-loader/backers.svg?width=890
[oc-backer-link]: https://opencollective.com/react-hot-loader#backers
[oc-sponsor-link]: https://opencollective.com/react-hot-loader#sponsor
