### Starter Kit
* [react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate) (Bare minimum)

### Migration to 3.0
- If you're using Babel and ES6, remove the `react-hot` loader from any loaders in your Webpack config, and add `react-hot-loader/babel` to the `plugins` section of your `.babelrc`:

```js
{
  "presets": ["es2015-loose", "stage-0", "react"],
  "plugins": ["react-hot-loader/babel"]
}
```

- If you're *not* using Babel, or you're using Babel without ES6, replace the `react-hot` loader in your Webpack config with `react-hot-loader/webpack`:

```js
{
  test: /\.js$/,
  loaders: ['react-hot', 'babel'],
  include: path.join(__dirname, '..', '..', 'src')
}

// becomes
{
  test: /\.js$/,
  loaders: ['react-hot-loader/webpack', 'babel'],
  include: path.join(__dirname, '..', '..', 'src')
}
```

- 'react-hot-loader/patch' should be placed at the top of the `entry` section in your Webpack config.  An error will occur if any code runs before `react-hot-loader/patch` has, so put it in the first position.

- `<AppContainer>` - AppContainer is a component that handles module reloading, as well as error handling.  The root component of your app should be nested in AppContainer as a child.  When in production, AppContainer is automatically disabled, and simply returns its children.

- React Hot Loader 3 does not hide the hot module replacement API, so the following needs to be added below wherever you call `ReactDOM.render` in your app:

```js
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
    ReactDOM.render(
      <AppContainer>
        <App/>
      </AppContainer>
      />,
      document.getElementById('root')
    );
  });
}
```

You can also check out [this commit for the migration of a TodoMVC app from 1.0 to 3.0.](https://github.com/gaearon/redux-devtools/commit/64f58b7010a1b2a71ad16716eb37ac1031f93915)

### Source Maps

If you use `devtool: 'source-map'` (or its equivalent), source maps will be emitted to hide hot reloading code.

Source maps slow down your project. Use `devtool: 'eval'` for best build performance.

Hot reloading code is just one line in the beginning and one line in the end of each module so you might not need source maps at all.
