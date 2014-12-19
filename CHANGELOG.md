## Changelog

### 1.0

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
