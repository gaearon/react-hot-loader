This file serves as a repository of common problems setting up React Hot Loader, and solutions to them.

Know a problem? Edit this file and send a PR?

### Build Doesn't Work

#### Cannot resolve 'file' or 'directory' `react/lib/ReactMount`

If you're using a precompiled React instead of `react` npm package, React Hot Loader configuration will need a few tweaks. See [Usage with External React](https://github.com/gaearon/react-hot-loader/blob/master/docs/README.md#usage-with-external-react).

Make sure you have `'.js'` in `resolve.extensions` section of Webpack config, of Webpack won't be able to find any JS files without explicitly specifying extension in `require`.

### Hot Reload Doesn't Work

Generally, the best way to fix this class of errors is to compare your setup to [React Hot Boilerplate](https://github.com/gaearon/react-hot-boilerplate) very carefully and see what's different.

#### The following modules couldn't be hot updated: (They would need a full reload!)

If you get this warning when editing a root component, this may be because you don't export anything from it, and call `React.render` from there. Put your root component in a separate file (e.g. `App.jsx`) and `require` it from `index.js` where you call `React.render`.

This warning may also appear if you edit some non-component file which is `require`d from files other than components. This means hot update bubbled up, but the app couldn't handle it. This is normal! Just refresh.

### Other Problems

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
