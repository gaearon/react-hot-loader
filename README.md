# react-hot-loader

This is a **highly experimental** proof of concept of [React live code editing](http://www.youtube.com/watch?v=pw4fKkyPPg8).

It marries React with Webpack [Hot Module Replacement](http://webpack.github.io/docs/hot-module-replacement.html) by wrapping `React.createClass` calls in a custom function that updates components' prototypes when the changes come in.

Inspired by [react-proxy-loader](https://github.com/webpack/react-proxy-loader).

## Demo

### [Real Project Video Demo](https://vimeo.com/100010922)

### Bundled Example

![](http://f.cl.ly/items/0d0P3u2T0f2O163K3m1B/2014-07-14%2014_09_02.gif)

![](http://f.cl.ly/items/3T3u3N1d2U30380Z2k2D/2014-07-14%2014_05_49.gif)

## Installation

`npm install react-hot-loader`

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

```javascript
var Button = require('react-hot!./button');
```

When a component is imported that way, changes to its code should be applied **without unmounting it or losing its state**.

You can also specify loader in config before `jsx-loader`:

```javascript
    module: {
        loaders: [
            { test: /\.jsx$/, loaders: ['react-hot', 'jsx-loader'] }
        ]
    }
```

This will enable hot reload for all JSX files.

### Exceptions

Hot reload is disabled for modules that contain no `React.createClass` calls and/or don't export a valid React class. For example, in the sample project, `app.jsx` doesn't get live updates because it is assumed to have side-effects.

Several components in one file will work as long as their `displayName`s are different.

### Options

* `notify`: Loader can use desktop Notification API to show notifications when a module has been reloaded, or if it loads with an error. By default, this feature is disabled because it doesn't work well with `webpack-dev-server` iframe mode used in the example. If you don't use `webpack-dev-server`'s iframe mode, you might want to enable notifications. Valid values are `none` (default), `errors` and `all`. If `notify` is `errors` or `all`, module load errors won't cause page refresh.

## Running Example

```
npm install
npm start
open http://localhost:8080/webpack-dev-server/bundle
```

Then edit `example/a.jsx` and `example/b.jsx`.
Your changes should be displayed live, without unmounting components or destroying their state.

## Implementation Notes

Currently, it keeps a list of mounted instances and updates their prototypes when an update comes in.

A better approach may be to make monkeypatch `createClass` to return a proxy object [as suggested by Pete Hunt](https://github.com/webpack/webpack/issues/341#issuecomment-48372300):

>The problem is that references to component descriptors could be stored in any number of places. What we could do is wrap all components in "proxy" components which look up the "real" component in some mapping

# License

MIT (http://www.opensource.org/licenses/mit-license.php)
