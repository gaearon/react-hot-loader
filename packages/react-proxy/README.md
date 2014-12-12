react-hot
=========

This is a generic library implementing hot reload for React components without unmounting or losing their state.

It is used by [react-hot-loader](https://github.com/gaearon/react-hot-loader) but not tied to Webpack itself, so alternative build systems that support hot-reloading individual modules can use it to implement [live-editing for React components](http://gaearon.github.io/react-hot-loader/).

**[See the video.](https://vimeo.com/100010922)**

### API

#### `require('react-hot'): () => makeHot`

Invoke this once within each hot-reload capable module to get the second function.  
You must pass the result between all versions of the same module for hot reload to work.

#### `makeHot: (ReactClass, persistentId?) => ReactClass`

Registers a hot-reloadable React class. If you don't pass `persistentId`, it is inferred from `ReactClass.displayName` or `ReactClass.name` (for ES6 classes). When called for the first time, it will register class and return it. When called next time with the same `persistentId`, will patch original class with the prototype of new class, and return the original class.

### Usage

This library is not meant to be used directly, unless you're authoring a build tool like [react-hot-loader](https://github.com/gaearon/react-hot-loader).

It only makes sense if your build tool of choice is capable of two things:

* emitting next versions of the same module and evaluate them;
* passing arbitrary JS objects from previous to the next version of the same module.

I am only aware of [Webpack Hot Module Replacement](http://webpack.github.io/docs/hot-module-replacement.html) but eventually other implementations should arise.

Here's to use it:

#### A.js, first run

```javascript
var React = require('react');

// ---- you may want to generate this code -----
var makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot;
if (!makeHot) {
  // On the first run, we will get here
  makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot = require('react-hot')();
}
// ---- /you may want to generate this code -----

var A = React.createClass({
  render: function () {
    return <p>Version 1</p>;
  }
});

// ---- you may want to generate this code -----
// Will merely register A so it can later be patched
A = makeHot(A);
// ---- /you may want to generate this code -----

module.exports = A;
```

#### A.js, subsequent runs (emitted after user edits the source)
```javascript
var React = require('react');

// ---- you may want to generate this code -----
var makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot;
if (!makeHot) {
  // On the second run, we will *NOT* get here
  makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot = require('react-hot')();
}
// ---- /you may want to generate this code -----


var A = React.createClass({
  render: function () {
    return <p>Version 2</p>;
  }
});

// ---- you may want to generate this code -----
// Will patch existing A with updated methods, force re-rendering and return patched first version
A = makeHot(A);
// ---- /you may want to generate this code -----

module.exports = A;
```

