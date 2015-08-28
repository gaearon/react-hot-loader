## Changelog

### 1.3.0

* Recover from module errors on module level (**[#187](https://github.com/gaearon/react-hot-loader/pull/187)**)

### 1.2.9

* Silently ignore exports that raise an error when accessed (#114)
* Update `source-map` dependency

### 1.2.8

* Remove React from peerDependencies
* Update React Hot API to support React 0.14 beta 1

### 1.2.7

* Preserve CommonJS `exports` context in the wrapping closure (**[#124](https://github.com/gaearon/react-hot-loader/issues/124)**)

### 1.2.6

* Fix autobinding on newly added methods for `createClass`-style classes

### 1.2.5

* Fix “React is not defined” error

### 1.2.4

* Avoid updating each class twice in React 0.12

### 1.2.3

* Explicitly exclude `react/lib` files from processing. You **should** use `exclude: /node_modules/` in configuration, but at least this doesn't blow up for those who don't.

### 1.2.2

* Fix crash on React 0.13. Now compatible!

### 1.2.1

* Don't try to flatten inheritance chains, as it causes problems with `super`
* Instead, automatically opt custom base classes into hot reloading as long as they descend from `React.Component` (in React 0.13). If your custom base class doesn't do that but you'd still want to have hot reloading, you need to manually opt it in via `module.makeHot` API.

### 1.2.0

* Support hot-reloading components without a base class (**[react-hot-api#5](https://github.com/gaearon/react-hot-api/issues/5)**)
* Support hot-reloading inheritance chains (**[react-hot-api#10](https://github.com/gaearon/react-hot-api/issues/10)**)
* Support using React 0.13 as an external

### 1.1.7

* Add React 0.13 RC2 to peerDeps

### 1.1.6

* Allow React 0.13 RC1
* Better support for ES6 inheritance
* Fix reloading for modules with null prototype chain (**#82**)

### 1.1.5

* Wrap user code in IEFF to prevent losing `"use strict"`. Fixes #75

### 1.1.4

* Fix crash when hot-reloading element factory. (Note: React discourages exporting factories.)

### 1.1.3

* Avoid warnings on React 0.13

### 1.1.2

* Compatibility with React 0.13.0-beta.1

### 1.1.1

* Fix edge cases by requiring `react/lib/ReactMount` in transformed source files
* Add a warning if `ReactMount` doesn't return anything useful (e.g. when using external React)

### 1.1.0

* Skipping `node_modules` entirely [wasn't](https://github.com/gaearon/react-hot-loader/issues/58) [the best idea](https://github.com/gaearon/react-hot-loader/issues/55). Instead, we now specifically skip `node_modules/react/`, `node_modules/webpack/` and `node_modules/react-hot-loader/`. However you are still **encouraged** to [add `exclude: /node_modules/` to your loader config](https://github.com/gaearon/react-hot-boilerplate/blob/master/webpack.config.js#L24) for best performance.
* Now modules that don't export any valid React classes in `module.exports` or any its properties will not be auto-accepted. This prevents hot loader from trying to handle non-React updates and allows changes in plain JS files to propagate to components that can handle them. For example, this allows [react-jss](https://github.com/jsstyles/react-jss) mixin to apply hot updates to JSS styles.

### 1.0.7

* Skip `node_modules` entirely. Fixes [#54](https://github.com/gaearon/react-hot-loader/issues/54) on Windows.

### 1.0.6

* Add `require('react-hot-loader/Injection')` to override Hot Loader behavior. Now you can supply your own way of getting root component instances, so Hot Loader can also work in environment where `require('react/lib/ReactMount')` is not available (for example, [when React is used as standalone bundle and not NPM package](https://github.com/gaearon/react-hot-loader/issues/53)).

### 1.0.5

* Fix stack overflow when hotifying same class twice ([#52](https://github.com/gaearon/react-hot-loader/issues/52))

### 1.0.4

* Allow both `module.exports` and its properties be components (Fixes [#50](https://github.com/gaearon/react-hot-loader/issues/50))

### 1.0.3

* In addition to hotifying `module.exports` by default, also hotify all its own properties

### 1.0.2

* Don't try to hot-replace `module.export`ed `ReactElement`s

### 1.0.1

* Delay `require`ing `ReactMount` to avoid circular dependencies
* Don't process React or Webpack internals to avoid potential issues

### 1.0.0

* Don't rely on `createClass` regex or any other regex
* Only `module.exports` is hot by default
* Supports ES6 classes when they land in React 0.13
* Supports dynamically created classes
* Manual mode

See [what changed and how to migrate to 1.0](https://github.com/gaearon/react-hot-loader/blob/master/docs/README.md#migrating-to-10).

### 0.5.0

* Adds source map support, contributed by [Jake Riesterer](https://github.com/jRiest)

### 0.4.5

* Collapse all hot loader code in one line so it doesn't obscure beginning of file.

### 0.4.4

* Errors occuring in module definition (such as `ReferenceError`) should not disable further reloading (fixes **[#29](https://github.com/gaearon/react-hot-loader/issues/29)**)

### 0.4.3

* Support lowercase `react` reference name and usage with ES6 classes (`createClass(MyComponent.prototype)`) via **[#27](https://github.com/gaearon/react-hot-loader/issues/27)**

### 0.4.2

* Catch errors in modules and log them instead of reloading (fixes **[#21](https://github.com/gaearon/react-hot-loader/issues/21)**)

### 0.4.1

* Use more precise [`React.createClass` regex](https://github.com/gaearon/react-hot-loader/commit/f71c6785131adcc85b91789da0d0a0b9f1a9713f) to avoid matching own code when hot loader is applied to all JS files.

### 0.4.0

* Ignore files that contain no `createClass` calls (fixes **[#17](https://github.com/gaearon/react-hot-loader/issues/17)**)
* Remove the need for pitch loader (fixes **[#19](https://github.com/gaearon/react-hot-loader/issues/19)**)
* Improve performance by only using one loader instead of two
* Now that performance is acceptable, remove desktop notifications and `notify` option
* It is now recommended that you use `devtool: 'eval'` because it's much faster and has no downsides anymore

### 0.3.1

* Avoid warnings on old browsers with missing `Notification` API
* Errors don't cause page reload anymore

### 0.3.0

* Use React 0.11
