React Hot API
=========

This is a generic library implementing hot reload for React components without unmounting or losing their state.  

**It is intended for build tool authors or adventurous folk and *not* for website development. For a reference implementation *that you can actually use*, check out [react-hot-loader](https://github.com/gaearon/react-hot-loader) for Webpack.**

This library drives React hot-reload magic of **[react-hot-loader](https://github.com/gaearon/react-hot-loader)** but is not tied to Webpack itself, so alternative build systems that support hot-reloading individual modules can use it to implement **[live-editing for React components](http://gaearon.github.io/react-hot-loader/)**. For example, you can use this to **[integrate hot reloading into an atom-shell application](https://github.com/BenoitZugmeyer/chwitt-react/blob/2d62184986c7c183955dcb607dba5ceda70a2221/bootstrap-jsx.js#L33)**. 

**[See the video.](https://vimeo.com/100010922)**

### API

#### `makeHot: (ReactClass, persistentId?) => ReactClass`

Registers a hot-reloadable React class. If you don't pass `persistentId`, it is inferred from `ReactClass.displayName` or `ReactClass.name` (for ES6 classes). When called for the first time, it will merely return the passed class. When called the next time with the same `persistentId`, will patch original class with the prototype of the new class, and return the original class.

#### `require('react-hot-api'): (getRootInstances, React) => makeHot`

Invoke this once within each hot-reloadable module to obtain the function described above.  
You must pass the result between *all emitted versions of the same module* for hot reload to work.

`getRootInstances` is a method you as a caller should provide. It should return all root components on the page.
You can implement it by returning `require('react/lib/ReactMount')._instancesByReactRootID` but you may also want to return some known root instance, for example, if you host React Hot API on a webpage for a live editor playground.

### Usage

This library is not meant to be used directly, unless you're authoring a build tool like [React Hot Loader](https://github.com/gaearon/react-hot-loader).

It only makes sense if your build tool of choice is capable of two things:

* emitting next versions of the same module and evaluate them;
* passing arbitrary JS objects from previous to the next version of the same module.

I am only aware of [Webpack Hot Module Replacement](http://webpack.github.io/docs/hot-module-replacement.html) but eventually other implementations should arise.

In which case, here's how you can tranform the source to use it:

##### SomeComponent.js, first run

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
  makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot = require('react-hot-api')(require('react/lib/ReactMount'));
}

// Will merely register SomeComponent so it can later be patched
module.exports = makeHot(module.exports);
```

##### SomeComponent.js, subsequent runs (emitted after user edits the source)
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
  makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot = require('react-hot-api')(require('react/lib/ReactMount'));
}

// Will patch existing SomeComponent with updated methods, force re-rendering and return patched first version
module.exports = makeHot(module.exports);
```

You may also give user some way to access `makeHot` in case they want to allow hot-reloading for arbitrary classes inside the module:

##### AnonComponents.js
```javascript
// The user still doesn't need to know these lines are being inserted by the tool:
var module.makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot;
if (!module.makeHot) {
  // put the function into some sane place (e.g. module.makeHot) without relying on hidden variables
  module.makeHot = SOME_STORAGE_SHARED_BETWEEN_VERSIONS_OF_SAME_MODULE.makeHot = require('react-hot-api')(require('react/lib/ReactMount'));
}
// You might generate the code above with your build tool
// to hide hot reloading mechanics from user.
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

### Thanks

* [Tobias Koppers](https://github.com/sokra) for Webpack and HMR;
* [Johannes Lumpe](https://github.com/johanneslumpe) and [Ben Alpert](https://github.com/spicyj) for helping me come up with the original hot reloading approach I'm still using here;
* [Omar Skalli](https://github.com/Chetane) for coming up with an approach for forcing tree update that is compatible with ES6 classes [just the moment I needed it most](https://twitter.com/dan_abramov/status/543174410493239297);
* [Kyle Mathews](http://github.com/KyleAMathews) for being the first person to actually use hot loader and helping spread the word when it was in initial stages;
* [Christopher Chedeau](https://github.com/vjeux) for retweeting my horrendously hacked together proof of concept video, overwhelming response from which gave me the incentive to actually finish this thing;
* Bret Victor for making me think live editing should be the norm, although he probably hates what people do after watching his videos.
