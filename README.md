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

2. Mark your root application as _hot-exported_:

```js
// ./containers/App.js
import React from 'react'
import { hot } from 'react-hot-loader'

const App = () => <div>Hello World!</div>

export default hot(module)(App)
```

> Note: does nothing in production mode, just passes App thought.

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

### TypeScript

When using TypeScript, Babel is not required, but RHL will not work without it.
Just add babel-loader into your webpack configuration, with RHL-only config.

```js
{
  test: /\.tsx?$/,
  loaders: [
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

### Source Maps

If you use `devtool: 'source-map'` (or its equivalent), source maps will be
emitted to hide hot reloading code.

Source maps slow down your project. Use `devtool: 'eval'` for best build
performance.

Hot reloading code is just one line in the beginning and one line in the end of
each module so you might not need source maps at all.

### Code Splitting

As long most of modern react-component-loader
([loadable-components](https://github.com/smooth-code/loadable-components/),
[react-loadable](https://github.com/thejameskyle/react-loadable), and so on)
does not, and should not support RHL, just mark export of exported component as
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
export default hot(module)(MyComponent)
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

## Starter Kit

This
[boilerplate](https://github.com/gaearon/react-hot-loader/tree/master/boilerplate)
is the most basic config following getting started sections.

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

## Known limitations and side effects

### The original class got updated

On code replace you are replacing the old code by a new one. You should not use
the old code, as thus allow RHL to safely modify it. See
[`react-stand-in`](https://github.com/gaearon/react-hot-loader/tree/master/packages/react-stand-in)
for more details.

### New Components keep executing the old code

There is no way to hot-update constructor code, as result even new components
will be born as the first ones, and then grow into the last ones. See
[`react-stand-in`](https://github.com/gaearon/react-hot-loader/tree/master/packages/react-stand-in)
for more details.

### Decorators

Some decorators may not work, as long they can alter the base class in a
unexpected way. Please report.

## Troubleshooting

If it doesn't work, in 99% cases it's a configuration issue. A missing option, a
wrong path or port. Webpack is very strict about configuration, and the best way
to find out what's wrong is to compare your project to an already working setup,
such as
**[boilerplate](https://github.com/gaearon/react-hot-loader/tree/master/boilerplate)**,
bit by bit.

If something doesn't work, in 99% cases it's an issue with your code - Component
doesn't got registered, due to HOC or Decorator around it, which making it
invisible to Babel plugin, or Webpack loader.

We're also gathering
**[Troubleshooting Recipes](https://github.com/gaearon/react-hot-loader/blob/master/docs/Troubleshooting.md)**
so send a PR if you have a lesson to share!

## License

MIT

[build-badge]: https://img.shields.io/travis/gaearon/react-hot-loader.svg?style=flat-square
[build]: https://travis-ci.org/gaearon/react-hot-loader
[coverage-badge]: https://img.shields.io/codecov/c/github/gaearon/react-hot-loader.svg?style=flat-square
[coverage]: https://codecov.io/github/gaearon/react-hot-loader
[version-badge]: https://img.shields.io/npm/v/react-hot-loader.svg?style=flat-square
[package]: https://www.npmjs.com/package/react-hot-loader
[license-badge]: https://img.shields.io/npm/l/react-hot-loader.svg?style=flat-square
[license]: https://github.com/gaearon/react-hot-loader/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[chat]: https://gitter.im/gaearon/react-hot-loader
[chat-badge]: https://img.shields.io/gitter/room/gaearon/react-hot-loader.svg?style=flat-square
[github-watch-badge]: https://img.shields.io/github/watchers/gaearon/react-hot-loader.svg?style=social
[github-watch]: https://github.com/gaearon/react-hot-loader/watchers
[github-star-badge]: https://img.shields.io/github/stars/gaearon/react-hot-loader.svg?style=social
[github-star]: https://github.com/gaearon/react-hot-loader/stargazers
