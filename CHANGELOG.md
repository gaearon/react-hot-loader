## Changelog

### 3.1.1

* Revert fix arrow function that uses props in constructor (#670)
* Remove babel-template dependency (#671)

### 3.1.0

* Add an option to disable warnings (#669)
* Fix arrow function that uses props in constructor (#670)

### 3.0.0

* Add React 16 support (#629, #658)
* Remove RedBox as default error catcher (#494)

### 3.0.0-beta.6

* Use production versions of `patch` and `AppContainer` if no `module.hot` available, so it doesn't break people using `NODE_ENV=test`. (#398)
* Opt out of transforming static class properties. (#381)

### 3.0.0-beta.5

* Makes the class properties portion of the Babel plugin work with async functions. (#372)
* Change the output of the tagger code in the Babel plugin so that it doesn't break the output of `babel-node`. (#374)

### 3.0.0-beta.4

* Extends the Babel plugin to enable hot reloading of class properties. (#322)
* Fixes a bug in the Webpack loader from a component importing a module with the same basename. (#347)

### 3.0.0-beta.3

* Fixes broken import of RedBox, which led to confusing stack traces when applications threw errors. (#314)
* Add `module.hot` checks to conditional `require()`s to remove unnecessary warnings when using server rendering. (#302)

### 3.0.0-beta.2

* Patch `React.createFactory` (#287)
* Fix props typo (#285)

### 3.0.0-beta.1

* Adds complete React Router support. Async routes should work fine now. (#272)
* Fixes a nasty bug which caused unwrapped component to render. (#266, #272)
* Fixes an issue that caused components with `shouldComponentUpdate` optimizations not getting redrawn (#269, 2a1e384d54e1919117f70f75dd20ad2490b1d9f5)
* Internal: a rewrite and much better test coverage.

### 3.0.0-beta.0

* Fixes an issue when used in Webpack 2 (https://github.com/gaearon/react-hot-loader/issues/263)
* **Breaking change:** instead of

  ```js
<AppContainer component={App} props={{ prop: val }} />
```

  you now need to write

  ```js
  <AppContainer>
    <App prop={val} />
  </AppContainer>
  ```

  (#250)

  **See [this commit](https://github.com/gaearon/react-hot-boilerplate/commit/b52c727937a499f3efdc5dceb74ae952aa318c3a) as an update reference!**

### 3.0.0-alpha

Big changes both to internals and usage. No docs yet but you can look at https://github.com/gaearon/react-hot-boilerplate/pull/61 for an example.

### 2.0.0-alpha

**Experimental release that isn't really representative on what will go in 2.0, but uses the new engine.**

Some ideas of what should be possible with the new engine:

* There is no requirement to pass `getRootInstances()` anymore, so React Hot Loader doesn't need `react/lib/ReactMount` or walk the tree, which was somewhat fragile and changing between versions
* Static methods and properties are now hot-reloaded
* Instance getters and setters are now hot reloaded
* Static getters and setters are now hot reloaded
* Deleted instance methods are now deleted during hot reloading
* Single method form of [autobind-decorator](https://github.com/andreypopp/autobind-decorator) is now supported

What might get broken:

* We no longer overwrite or even touch the original class. Every time makeHot is invoked, it will return a special proxy class. This means a caveat: for example, static methods will only be hot-reloaded if you refer to them as `this.constructor.doSomething()` instead of `FooBar.doSomething()`. This is because React Hot Loader calls `makeHot` right before exporting, so `FooBar` still refers to the original class. Similarly, `this.constructor === App` will be `false` inside `App` unless you call `App = makeHot(App)` manually, which you can't do with React Hot Loader. **I'm not sure how much of a problem this will be, so let me know if it pains you.** In the longer term, we will deprecate React Hot Loader in favor of a Babel plugin which will be able to rewrite class definitions correctly, so it shouldn't be a problem for a long time. If there is demand, we can introduce a mode that rewrites passed classes, too.

### 1.3.1

* Fix import for ReactMount to support 15.4.0 (**[#430](https://github.com/gaearon/react-hot-loader/pull/430)**)

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
