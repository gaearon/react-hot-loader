>## A Big Update Is Coming

>React Hot Loader 3 is [on the horizon](https://github.com/gaearon/react-hot-loader/pull/240), and you can try it today ([boilerplate branch](https://github.com/gaearon/react-hot-boilerplate/pull/61), [upgrade example](https://github.com/gaearon/redux-devtools/commit/64f58b7010a1b2a71ad16716eb37ac1031f93915)). It fixes some [long-standing issues](https://twitter.com/dan_abramov/status/722040946075045888) with both React Hot Loader and React Transform, and is intended as a replacement for both. The docs are not there yet, but they will be added before the final release. For now, [this commit](https://github.com/gaearon/redux-devtools/commit/64f58b7010a1b2a71ad16716eb37ac1031f93915) is a good reference.


React Hot Boilerplate
=====================

The minimal dev environment to enable live-editing React components.

### Usage

```
npm install
npm start
open http://localhost:3000
```

Now edit `src/App.js`.  
Your changes will appear without reloading the browser like in [this video](http://vimeo.com/100010922).

### Linting

This boilerplate project includes React-friendly ESLint configuration.

```
npm run lint
```

### Using `0.0.0.0` as Host

You may want to change the host in `server.js` and `webpack.config.js` from `localhost` to `0.0.0.0` to allow access from same WiFi network. This is not enabled by default because it is reported to cause problems on Windows. This may also be useful if you're using a VM.

### Missing Features

This boilerplate is purposefully simple to show the minimal configuration for React Hot Loader. For a real project, you'll want to add a separate config for production with hot reloading disabled and minification enabled. You'll also want to add a router, styles and maybe combine dev server with an existing server. This is out of scope of this boilerplate, but you may want to look into [other starter kits](https://github.com/gaearon/react-hot-loader/blob/master/docs/README.md#starter-kits).

### Dependencies

* React
* Webpack
* [webpack-dev-server](https://github.com/webpack/webpack-dev-server)
* [babel-loader](https://github.com/babel/babel-loader)
* [react-hot-loader](https://github.com/gaearon/react-hot-loader)

### Resources

* [Demo video](http://vimeo.com/100010922)
* [react-hot-loader on Github](https://github.com/gaearon/react-hot-loader)
* [Integrating JSX live reload into your workflow](http://gaearon.github.io/react-hot-loader/getstarted/)
* [Troubleshooting guide](https://github.com/gaearon/react-hot-loader/blob/master/docs/Troubleshooting.md)
* Ping dan_abramov on Twitter or #reactjs IRC
