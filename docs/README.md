### Starter Kits
* [react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate) (Bare minimum)

### Source Maps

If you use `devtool: 'source-map'` (or its equivalent), source maps will be emitted to hide hot reloading code.

Source maps slow down your project. Use `devtool: 'eval'` for best build performance.

Hot reloading code is just one line in the beginning and one line in the end of each module so you might not need source maps at all.

### React Hot API

If you're authoring a build tool, you might be interested to hear that React Hot Loader brains have been extracted into runtime-agnostic [React Hot API](https://github.com/gaearon/react-hot-api). React Hot Loader just binds that API to Webpack runtime, but you can implement yours too.
