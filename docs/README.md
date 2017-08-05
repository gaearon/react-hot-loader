### Starter Kit

Provided by collaborators:
* [react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate/tree/next) (Bare minimum)
* [react-hot-loader-minimal-boilerplate](https://github.com/wkwiatek/react-hot-loader-minimal-boilerplate)* (Bare minimum)

Provided by community:
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

### Migration to 3.0
- If you're using Babel and ES6, remove the `react-hot` loader from any loaders in your Webpack config, and add `react-hot-loader/babel` to the `plugins` section of your `.babelrc`:

```js
// .babelrc
{
  "presets": ["es2015-loose", "stage-0", "react"],
  "plugins": ["react-hot-loader/babel"]
}
```

- If you're *not* using Babel, or you're using Babel without ES6, replace the `react-hot` loader in your Webpack config with `react-hot-loader/webpack`:

```js
// webpack.config.js
{
  test: /\.js$/,
  loaders: ['react-hot', 'babel']
}

// becomes
// webpack.config.js
{
  test: /\.js$/,
  loaders: ['react-hot-loader/webpack', 'babel']
}
```

- 'react-hot-loader/patch' should be placed at the top of the `entry` section in your Webpack config. An error will occur if any app code runs before `react-hot-loader/patch` has, so put it in the first position. However, if you're using polyfills put them before patch:

```js
// webpack.config.js
{
  entry: {
    'app': [
      'babel-polyfill',
      'react-hot-loader/patch',
      './src/index'
    ]
  }
}
```

- `<AppContainer/>` is a component that handles module reloading, as well as error handling. The root component of your app should be nested in AppContainer as a child. When in production, AppContainer is automatically disabled, and simply returns its children.

- React Hot Loader 3 does not hide the hot module replacement API, so the following needs to be added below wherever you call `ReactDOM.render` in your app:

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './containers/App'

ReactDOM.render(
  <AppContainer>
    <App/>
  </AppContainer>,
  document.getElementById('root')
);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./containers/App', () => {
    const NextApp = require('./containers/App').default;
    ReactDOM.render(
      <AppContainer>
        <NextApp/>
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
```

You can also check out [this commit for the migration of a TodoMVC app from 1.0 to 3.0.](https://github.com/gaearon/redux-devtools/commit/64f58b7010a1b2a71ad16716eb37ac1031f93915)

## Webpack 2

Because Webpack 2 has built-in support for ES2015 modules, you won't need to re-require your app root in `module.hot.accept`. The example above becomes:

> Note: To make this work, you'll need to opt out of Babel transpiling ES2015 modules by changing the Babel ES2015 preset to be `["es2015", { "modules": false }]`

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import App from './containers/App'

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./containers/App', () => { render(App) })
}
```

### Source Maps

If you use `devtool: 'source-map'` (or its equivalent), source maps will be emitted to hide hot reloading code.

Source maps slow down your project. Use `devtool: 'eval'` for best build performance.

Hot reloading code is just one line in the beginning and one line in the end of each module so you might not need source maps at all.

## Migrating from [create-react-app](https://github.com/facebookincubator/create-react-app)

* Run `npm run eject`
* Install React Hot Loader (`npm install --save-dev react-hot-loader@next`)
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
    {
       test: /\.(js|jsx)$/,
       include: paths.appSrc,
       loader: 'babel',
       query: {
         cacheDirectory: findCacheDir({
           name: 'react-scripts'
         }),
         plugins: [
           'react-hot-loader/babel'
         ]
       }
    }
  ```

* Add `AppContainer` to `src/index.js` (see `AppContainer` section in [Migration to 3.0 above](https://github.com/gaearon/react-hot-loader/blob/master/docs/README.md#migration-to-30))

## TypeScript

When using TypeScript, Babel is not required, so your config should look like ([demo](https://github.com/Glavin001/react-hot-ts)):

```js
{
  test: /\.tsx?$/,
  loaders: ['react-hot-loader/webpack', 'ts-loader'] // (or awesome-typescript-loader)
}
```
