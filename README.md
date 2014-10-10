# react-hot-loader

This is a **stable for daily use in development** implementation of [React live code editing](http://www.youtube.com/watch?v=pw4fKkyPPg8).

* Get inspired by a **[demo video](https://vimeo.com/100010922).**

* Read **[technical explanation and integration walkthrough](http://gaearon.github.io/react-hot-loader/).**

* For CoffeeScript, check out **[coffee-react-quickstart](https://github.com/KyleAMathews/coffee-react-quickstart)**.

>Hate reading? Use **[react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate)** for your next ReactJS project.

## Installation

`npm install react-hot-loader`

## Usage

#### **[Read the walkthrough!](http://gaearon.github.io/react-hot-loader/#integration)**

Seriously! It covers:

* porting a project to use Webpack;
* enabling Hot Module Replacement;
* integrating react-hot-loader.

Also check out **[coffee-react-quickstart](https://github.com/KyleAMathews/coffee-react-quickstart)** for an integration example with Gulp and CoffeeScript.

### Exceptions

Hot reload is disabled for modules that contain no `React.createClass` calls and/or don't export a valid React class. For example, in the sample project, `app.jsx` doesn't get live updates because it is assumed to have side-effects.

Several components in one file will work as long as their `displayName`s are different.

### Source Maps

If you use `devtool: 'source-map'` (or its equivalent), source maps will be emitted to hide hot reloading code.

This also works when previous loader emits its own source maps.

## Running Example

```
npm install
npm start
open http://localhost:8080/webpack-dev-server/bundle
```

Then edit `example/a.jsx` and `example/b.jsx`.
Your changes should be displayed live, without unmounting components or destroying their state.

![](http://f.cl.ly/items/0d0P3u2T0f2O163K3m1B/2014-07-14%2014_09_02.gif)

![](http://f.cl.ly/items/3T3u3N1d2U30380Z2k2D/2014-07-14%2014_05_49.gif)

## Implementation Notes

Currently, it keeps a list of mounted instances and updates their prototypes when an update comes in.

A better approach may be to make monkeypatch `createClass` to return a proxy object [as suggested by Pete Hunt](https://github.com/webpack/webpack/issues/341#issuecomment-48372300):

>The problem is that references to component descriptors could be stored in any number of places. What we could do is wrap all components in "proxy" components which look up the "real" component in some mapping

## Changelog

#### 0.5.0

* Adds source map support, contributed by [Jake Riesterer](https://github.com/jRiest)

#### 0.4.5

* Collapse all hot loader code in one line so it doesn't obscure beginning of file.

#### 0.4.4

* Errors occuring in module definition (such as `ReferenceError`) should not disable further reloading (fixes **[#29](https://github.com/gaearon/react-hot-loader/issues/29)**)

#### 0.4.3

* Support lowercase `react` reference name and usage with ES6 classes (`createClass(MyComponent.prototype)`) via **[#27](https://github.com/gaearon/react-hot-loader/issues/27)**

#### 0.4.2

* Catch errors in modules and log them instead of reloading (fixes **[#21](https://github.com/gaearon/react-hot-loader/issues/21)**)

#### 0.4.1

* Use more precise [`React.createClass` regex](https://github.com/gaearon/react-hot-loader/commit/f71c6785131adcc85b91789da0d0a0b9f1a9713f) to avoid matching own code when hot loader is applied to all JS files.

#### 0.4.0

* Ignore files that contain no `createClass` calls (fixes **[#17](https://github.com/gaearon/react-hot-loader/issues/17)**)
* Remove the need for pitch loader (fixes **[#19](https://github.com/gaearon/react-hot-loader/issues/19)**)
* Improve performance by only using one loader instead of two
* Now that performance is acceptable, remove desktop notifications and `notify` option
* It is now recommended that you use `devtool: 'eval'` because it's much faster and has no downsides anymore

#### 0.3.1

* Avoid warnings on old browsers with missing `Notification` API
* Errors don't cause page reload anymore

#### 0.3.0

* Use React 0.11

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
