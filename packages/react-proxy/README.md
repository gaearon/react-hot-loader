react-hot
=========

This is a generic library implementing hot reload for React components without unmounting or losing their state.  

**It is intended for build tool authors or adventurous folk and *not* for website development. For a reference implementation *that you can actually use*, check out [react-hot-loader](https://github.com/gaearon/react-hot-loader) for Webpack.**

This library drives React hot-reload magic of **[react-hot-loader](https://github.com/gaearon/react-hot-loader)** but is not tied to Webpack itself, so alternative build systems that support hot-reloading individual modules can use it to implement **[live-editing for React components](http://gaearon.github.io/react-hot-loader/)**.

**[See the video.](https://vimeo.com/100010922)**

### API

#### `makeHot: (ReactClass, persistentId?) => ReactClass`

Registers a hot-reloadable React class. If you don't pass `persistentId`, it is inferred from `ReactClass.displayName` or `ReactClass.name` (for ES6 classes). When called for the first time, it will merely return the passed class. When called the next time with the same `persistentId`, will patch original class with the prototype of the new class, and return the original class.

#### `require('react-hot'): () => makeHot`

Invoke this once within each hot-reload capable module to get the function described above.  
You must pass the result between *all emitted versions of the same module* for hot reload to work.

### Usage

This library is not meant to be used directly, unless you're authoring a build tool like [react-hot-loader](https://github.com/gaearon/react-hot-loader).

It only makes sense if your build tool of choice is capable of two things:

* emitting next versions of the same module and evaluate them;
* passing arbitrary JS objects from previous to the next version of the same module.

I am only aware of [Webpack Hot Module Replacement](http://webpack.github.io/docs/hot-module-replacement.html) but eventually other implementations should arise.

In which case, here's how you can tranform the source to use it:

#### A.js, first run

```javascript
var React = require('react');

var SomeComponent = React.createClass({
  render: function () {
    return <p>Version 1</p>;
  }
});

module.exports = SomeComponent;


// ================================================
// The code you might generate with your build tool
// to hide hot reloading mechanics from user:

var makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot;
if (!makeHot) {
  // On the first run, we will get here
  makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot = require('react-hot')();
}

// Will merely register SomeComponent so it can later be patched
module.exports = makeHot(module.exports);
```

#### A.js, subsequent runs (emitted after user edits the source)
```javascript
var React = require('react');

var SomeComponent = React.createClass({
  render: function () {
    return <p>Version 2</p>;
  }
});

module.exports = SomeComponent;


// ================================================
// The code you might generate with your build tool
// to hide hot reloading mechanics from user:

var makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot;
if (!makeHot) {
  // On the second run, we will *NOT* get here
  makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot = require('react-hot')();
}

// Will patch existing SomeComponent with updated methods, force re-rendering and return patched first version
module.exports = makeHot(module.exports);
```

You may also give user some way to access `makeHot` in case they want to allow hot-reloading for arbitrary classes inside the module:

```javascript
// The user still doesn't need to know these lines are being inserted by the tool:
var module.makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot;
if (!module.makeHot) {
  // put the function into some sane place (e.g. module.makeHot) without relying on hidden variables
  module.makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot = require('react-hot')();
}
// ================================================


var React = require('react');

function createLabelComponent(str) {
  var cls = React.createClass({
    render: function () {
      return <span>{str}</span>;
    }
  });
  
  // ... but you may give user freedom to do this:
  if (module.makeHot) { // we're in development and makeHot is available
    cls = module.makeHot(cls, str); // use parameter as unique ID for anon class
  }
  
  return cls;
}

// These will be hot-reloadable:
var Foo = createLabelComponent('Foo');
var Bar = createLabelComponent('Bar');
```
