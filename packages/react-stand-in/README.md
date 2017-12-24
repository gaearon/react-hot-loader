# React Stand-In (Facade) [![build status](https://img.shields.io/travis/thekashey/react-stand-in/master.svg?style=flat-square)](https://travis-ci.org/thekashey/react-stand-in) [![npm version](https://img.shields.io/npm/v/react-stand-in.svg?style=flat-square)](https://www.npmjs.com/package/react-stand-in)

A successor of [react-proxy](https://github.com/gaearon/react-proxy), created
especially for react-hot-loader case. From API point of view - this **is**
react-proxy.

The differences from react-proxy:

* does not proxy or wrap source component, but inherits from and replaces it.
* may replace the base class with the latest class variant.
* applies changes made in constructor

### How it works

React stand in is a real stand in. To satisfy goal it:

1. Inherits from the base class, keeping the all `real` method in prototype
2. On HMR it **replaces** the class prototype by the new component. Now it
   inherits from the new class variant.
3. To pass the babel's runtime checks it also replaces prototype of the base
   class.
4. It copies over all static fields from a new class variant.
5. It creates a new and the old class, checking of some class member are
   changed, creating the `upgrade` list.
6. On a construction, or unevolded component render it applies the upgrade list.

The keys points from here, **you should keep in mind**.

* Point 3 means than in es2015 env stand-in WILL have a sideeffect on the base
  class, **soiling it by the new code**. As long the old class have been just
  replaced by a new one - this is ok.
* Point 6 means than you will always instance the `first` class, and next
  upgrating it to the last one. There is no way to replace constructor for ES6
  classes.

## Requirements

* React 0.15+

## Usage

Intended to be used from hot reloading tools like React Hot Loader.\
If you’re an application developer, it’s unlikely you’ll want to use it directly.

You will need something like
[react-deep-force-update](https://github.com/gaearon/react-deep-force-update) to
re-render the component tree after applying the update.

```js
import React, { Component } from 'react'

class ComponentVersion1 extends Component {
  render() {
    return <div>Before hot update.</div>
  }
}

class ComponentVersion2 extends Component {
  render() {
    return <div>After hot update.</div>
  }
}
```

Without React Proxy:

```js
const rootEl = document.getElementById('root')
React.render(<ComponentVersion1 />, rootEl)

// Will reset state and kill DOM :-(
React.render(<ComponentVersion2 />, rootEl)
```

With React Facade:

```js
import React from 'react'
import { render } from 'react-dom'
import createProxy from 'react-stand-in'
import deepForceUpdate from 'react-deep-force-update'

// Create a proxy object, given the initial React component class.
const proxy = createProxy(ComponentVersion1)

// Obtain a React class that acts exactly like the initial version.
// This is what we'll use in our app instead of the real component class.
const Proxy = proxy.get()

// Render the component (proxy, really).
const rootInstance = render(<Proxy />, rootEl)

// Point the proxy to the new React component class by calling update().
// Instances will stay mounted and their state will be intact, but their methods will be updated.
proxy.update(ComponentVersion2)

// Force-update the whole React component tree.
// Until React provides an official DevTools API to do this,
// you should keep the reference to the root instance(s).
deepForceUpdate(rootInstance)
```

## Features (~99% React-proxy)

* Supports only modern (ES6 classes) style
* Supports inherited and base classes (although you shouldn’t use inheritance
  with React)
* Contains an extensive test suite to avoid regressions
* Preserves `displayName`
* Preserves enumerability and writability of methods
* Preserves `toString()` of methods
* Replaces instance getters and setters
* Replaces instance methods preserving their identity
* Replaces bound instance methods preserving their identity
* Because identity is preserved, instance methods already scheduled for
  `setInterval` or `setTimeout` are updated
* Replaces static getters and setters
* Replaces unbound static methods
* Replaces static properties unless they were overwritten by code
* Sets up `this.constructor` to match the most recent class

## License

MIT
