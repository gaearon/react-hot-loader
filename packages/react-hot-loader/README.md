# React Hot Loader

[![Build Status][build-badge]][build]
[![version][version-badge]][package]
[![MIT License][license-badge]][LICENSE]

[![PRs Welcome][prs-badge]][prs]
[![Chat][chat-badge]][chat]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]

Tweak React components in real time ⚛️⚡️

Watch **[Dan Abramov's talk on Hot Reloading with Time Travel](https://www.youtube.com/watch?v=xsSnOQynTHs).**

## Install

```
npm install --save react-hot-loader
```
> Note: You can safely install react-hot-loader as a regular dependency instead of a dev dependency as it automatically ensures it is not executed in production and the footprint is minimal.

## Getting started

1. Add `react-hot-loader/babel` to your `.babelrc`:

```js
// .babelrc
{
  "plugins": ["react-hot-loader/babel"]
}
```

2. [Enable Hot Module Replacement in Webpack](https://webpack.js.org/guides/hot-module-replacement/#enabling-hmr)

3. Add `react-hot-loader/patch` at the top of the entry section (except polyfills) of your Webpack config:

```js
// webpack.config.js
module.exports = {
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    './main.js'
  ]
}
```

> Note: Make sure to set the `output.publicPath` property to `"/"` as well. Otherwise hot reloading won't work as expected for nested routes.

4. Setup React-hot-loader to update your application when its code updates.

4.1 Wrap your application into `<AppContainer>`, all children of `<AppContainer>` will be reloaded when a change occurs:
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
> Note: To make this work, you'll need to opt out of Babel transpiling ES2015 modules by changing the Babel ES2015 preset to be `["env", { "modules": false }]`

4.2 Or mark your Application as hotExported.
```js
// ./containers/App.js
import {hotExported} from 'react-hot-loader'
const App = () => <div>MY APPLICATION</div>

export default hotExported(module, all); // <---


// -----------
// main.js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './containers/App'

const render = Component => {
  // there is no AppContainer here
  ReactDOM.render(
    <Component />,
    document.getElementById('root'),
  )
}

render(App)
``` 
This is far more easier way, and it is also __compatible with any source code splitting__ and deferred components loading library, 
but can introduce strange behavior in case you export non-React components from App.js.
You can mix 4.1 and 4.2, using the first one on Application level, and the second on chunk level. 

## Migrating from [create-react-app](https://github.com/facebookincubator/create-react-app)

* Run `npm run eject`
* Install React Hot Loader (`npm install --save-dev react-hot-loader`)
* In `config/webpack.config.dev.js`:
  1. Add `'react-hot-loader/patch'` to entry array (anywhere before `paths.appIndexJs`). It should now look like (excluding comments):
  ```js
    entry: [
      'react-hot-loader/patch',
      require.resolve('react-dev-utils/webpackHotDevClient'),
      require.resolve('./polyfills'),
      paths.appIndexJs
    ]
  ```

  2. Add `'react-hot-loader/babel'` to Babel loader configuration. The loader should now look like:
  ```js
    // Process JS with Babel.
    {
      test: /\.(js|jsx)$/,
      include: paths.appSrc,
      loader: require.resolve('babel-loader'),
      options: {
  
        // This is a feature of `babel-loader` for webpack (not Babel itself).
        // It enables caching results in ./node_modules/.cache/babel-loader/
        // directory for faster rebuilds.
        cacheDirectory: true,
        plugins: [
          'react-hot-loader/babel'
        ]
      },
    },
  ```

* Add `AppContainer` to `src/index.js` or mark your App as _hot-exported_ (see step 4 of Getting Started).

## TypeScript

When using TypeScript, Babel is not required, and you can use RHL without babel as long you dont have any arrow functions(transpiling to the es2015 code).
In case you want to use latest version of EcmaScript - please include babel plugin to your config.
In case you wont - add a webpack loader to your config.

```js
{
  test: /\.tsx?$/,
  loaders: ['react-hot-loader/webpack', 'ts-loader'] // (or awesome-typescript-loader)
}
```

## Source Maps

If you use `devtool: 'source-map'` (or its equivalent), source maps will be emitted to hide hot reloading code.

Source maps slow down your project. Use `devtool: 'eval'` for best build performance.

Hot reloading code is just one line in the beginning and one line in the end of each module so you might not need source maps at all.

## React Native

React Native **[supports hot reloading natively](https://facebook.github.io/react-native/blog/2016/03/24/introducing-hot-reloading.html)** as of version 0.22.

## Adding a custom error reporter

The previously used `Redbox` for React Hot Loader has known limitations due to sourcemaps and it's no longer a default catcher. Errors are great to clearly see rendering issues, and avoiding an uncaught error from breaking your app. But there are some advantages to a thrown error in the console too, like filename resolution via sourcemaps, and click-to-open. To get the `Redbox` back, and have the best of both worlds, modify your app entry point as follows:

```js
import Redbox from 'redbox-react';

const CustomErrorReporter = ({ error }) => <Redbox error={ error } />;

CustomErrorReporter.propTypes = {
  error: React.PropTypes.instanceOf(Error).isRequired
};

render((
  <AppContainer errorReporter={ CustomErrorReporter }>
    <AppRoot />
  </AppContainer>
), document.getElementById('react-root'));
```

You'll also need to `npm install --save-dev redbox-react`.

## Starter Kit

Provided by collaborators:
* [react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate/tree/next) (Bare minimum)
* [react-hot-loader-minimal-boilerplate](https://github.com/wkwiatek/react-hot-loader-minimal-boilerplate)* (Bare minimum)

Provided by community:
* [react-kit](https://github.com/thomasthiebaud/react-kit) (webpack v2, redux, react-router v4, code splitting, jest, saga, reselect)
* [hapi-react-hot-loader-example](https://github.com/codeBelt/hapi-react-hot-loader-example) (ES2015, Universal (SSR), React Hot Loader 3, React Router 4, Redux, Redux Saga, Redux Form, Async Component Code Splitting, Hapi, Webpack 3)
* [typescript-hapi-react-hot-loader-example](https://github.com/codeBelt/typescript-hapi-react-hot-loader-example) (TypeScript, Universal (SSR), React Hot Loader 3, React Router 4, Redux, Redux Saga, Redux Form, Async Component Code Splitting, Hapi, Webpack 3)
* [react-redux-styled-hot-universal](https://github.com/krasevych/react-redux-styled-hot-universal) (SSR, Universal Webpack, Redux, React-router, Webpack 2, Babel, Styled Components and more...)
* [webpack-react-redux](https://github.com/jpsierens/webpack-react-redux) (redux, react-router, hmr)
* [react-lego](https://github.com/peter-mouland/react-lego) (universal, react-router, other optional techs)
* [react-static-boilerplate](https://github.com/koistya/react-static-boilerplate) (static site generator; React, PostCSS, Webpack, BrowserSync)
* [react-cool-starter](https://github.com/wellyshen/react-cool-starter) (universal, redux, react-router, webpack 2, Babel, PostCSS, and more...)
* [react-redux-saga-boilerplate](https://github.com/gilbarbara/react-redux-saga-boilerplate) (react-router, redux, saga, webpack 2, jest w/ coverage, enzyme)
* [react-universal-boiler](https://github.com/strues/react-universal-boiler) (webpack 2, universal, react-router, redux, happypack)
* [apollo-fullstack-starter-kit](https://github.com/sysgears/apollo-fullstack-starter-kit) (universal, apollo, graphql, react, react-router, knex)
* [react-universally](https://github.com/ctrlplusb/react-universally) (universal, react, react router, express, seo, full stack webpack 2, babel)
* [meatier](https://github.com/mattkrick/meatier) (webpack 2 + hmr, universal, redux, graphql, react, react-router-redux, ssr)
* [react-hot-ts](https://github.com/Glavin001/react-hot-ts) (React, Webpack, TypeScript)
* [react-boilerplate-app](https://github.com/vebjorni/react-boilerplate-app) (react (duh), router, webpack with dev server, babel, hot reloading)
* [react-native-web](https://github.com/agrcrobles/react-native-web-webpack-starter) (react-native-web, webpack with dev server, hot reloading and flow soon...)
* [react-starter-kit](https://github.com/elios264/react-starter) (webpack 2 + htr + react + redux + router + babel + sass)
* [redux-react-starter](https://github.com/didierfranc/redux-react-starter) (webpack 2 + redux + react-redux 5 + react-router 4 + styled-component ...)
* [react-redux-universal-boilerplate](https://github.com/kiki-le-singe/react-redux-universal-boilerplate) (redux, react-router, universal, koa, webpack 2, babel, PostCSS, sass or cssnext, hot reloading, ...)
* [ARc](https://arc.js.org) (React, Jest, Storybook and other optional feature branches)
* [webpack-react-redux-starter](https://github.com/stsiarzhanau/webpack-react-redux-starter) (webpack 2, browsersync, babel, eslint, mocha, enzyme, jsdom, production config, detailed readme, and more...)
* [trowel](https://github.com/frux/trowel) (universal/ssr, redux, react-router 4, webpack 2, postcss)
* [react-navigation-web](https://github.com/agrcrobles/react-navigation-web) (react-navigation in web + redux, hot reloading!)
* [react-universal-hot-loader-starter-kit](https://github.com/earnubs/react-hot-loader-starter-kit) (universal express app with webpack 2, react-router 4, redux and react-hot-loader 3)
* [bare-minimum-react-hot-rr4-redux](https://github.com/nganbread/bare-minimum-react-hot-rr4-redux) (Bare minimum webpack 2, react-router 4, redux)
* [react-webpack2-boilerplate](https://github.com/plag/react-webpack2-boilerplate/) (Minimal react-router-3, react-redux, redux-saga on webpack2 with full hot reloading include reducers, sagas and react-components)
* [react-webpack-boilerplate](https://github.com/eqfox/react-webpack-boilerplate) (Boilerplate for ReactJS project with Webpack2 hot code reloading!)
* [react-boilerplatinum](https://github.com/Kikobeats/react-boilerplatinum) (Webpack2, Babel, React, Dev Server, PostCSS, SASS, PurifyCSS, HMR, Standard, Offline, BrowserSync)
* [ts-react-boilerplate](https://github.com/sotnikov-link/ts-react-boilerplate) (react, typescript 2, webpack 2 + hot-reload, karma + jasmine + coverage, sourcemaps)
* [react-boilerplate](https://github.com/mikechabot/react-boilerplate) (Dead simple boilerplate for ReactJS. Webpack 2, Redux. Hot Loader. Router)
* [molecule](https://github.com/timberio/molecule) (Production ready boilerplate targeting web & electron, using webpack 2, redux, react-hot-loader, immutable.js, react-router and more)
* [universal-js-hmr-ssr-react-redux](https://github.com/Alex-ray/v2-universal-js-hmr-ssr-react-redux) (Universal JS, Webpack 2, React Router 4, Server Side Rendering, Code Splitting, Redux, Express)


## Known limitations and side effects

### Components not replaced

- React Hot Loader will not replace any component `hot-reloaded` in node_modules

### Code Splitting

- As long most of modern react-component-loader (react-loadable, loadable-components, and so on) does not, and should not support RHL,
just mark export of exported component as `hotExported`

```js
//a.js
const AsyncComponent = loadable( () => import('./b.js'));

//b.js
import {hotExported} from 'react-hot-loader';
//....
export default hotExported(module, MyComponent);

```

Note that if you're using React Router (pre-4.0), this will only work with `getChildRoutes`, but not `getComponent`, since `getComponent`'s callback will only load a component once.

### Checking Element `type`s

Because React Hot Loader creates proxied versions of your components, comparing reference types of elements won't work:

```js
const element = <Component />;
console.log(element.type === Component); // false
```

One workaround is to create an element (that will have the `type` of the proxied component):
```js
const ComponentType = (<Component />).type;
const element = <Component />;
console.log(element.type === ComponentType); // true
```

Second - is to use helper function
```js
import {compareComponent} from 'react-hot-loader'
const element = <Component />;
compareComponent(element.type, Component); // true
```

You can also set a property on the component class:

```js
const Widget = () => <div>hi</div>;
Widget.isWidgetType = true;
console.log(<Widget />.type.isWidgetType); // true
```

### The original class got updated
On code replace you are replacing the old code by a new one. You should not use the old code, as thus allow RHL to safely modify it.
See react-stand-in for more details.

### New Components keep executing the old code
There is no way to hot-update constructor code, as result even new components will be born as the first ones, and then grow into the last ones.
See react-stand-in for more details.

### Decorators
Some decorators may not work, as long they can alter the base class in a unexpected way. Please report.


## Troubleshooting
If it doesn't work, in 99% cases it's a configuration issue.
A missing option, a wrong path or port. Webpack is very strict about configuration, and the best way to find out what's wrong is to compare your project to an already working setup, such as **[React Hot Boilerplate](https://github.com/gaearon/react-hot-boilerplate)**, bit by bit.

If something doesn't work, in 99% cases it's an issue with your code - Component doesn't got registered, due to HOC or Decorator around it, which making it invisible to Babel plugin, or Webpack loader.  

We're also gathering **[Troubleshooting Recipes](https://github.com/gaearon/react-hot-loader/blob/master/docs/Troubleshooting.md)** so send a PR if you have a lesson to share!

## [Patrons](PATRONS.md)

## License

MIT

[build-badge]: https://img.shields.io/travis/gaearon/react-hot-loader.svg?style=flat-square
[build]: https://travis-ci.org/gaearon/react-hot-loader
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
