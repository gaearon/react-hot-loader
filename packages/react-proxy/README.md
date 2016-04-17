# React Proxy [![build status](https://img.shields.io/travis/gaearon/react-proxy/master.svg?style=flat-square)](https://travis-ci.org/gaearon/react-proxy) [![npm version](https://img.shields.io/npm/v/react-proxy.svg?style=flat-square)](https://www.npmjs.com/package/react-proxy) 

A generic React component proxy useful for hot reloading. 

## Requirements

* React 0.14+

## Usage

Intended to be used from hot reloading tools like React Hot Loader.  
If you’re an application developer, it’s unlikely you’ll want to use it directly.

You will need something like [react-deep-force-update](https://github.com/gaearon/react-deep-force-update) to re-render the component tree after applying the update.

```js
import React, { Component } from 'react';

class ComponentVersion1 extends Component {
  render() {
    return <div>Before hot update.</div>;
  }
}

class ComponentVersion2 extends Component {
  render() {
    return <div>After hot update.</div>;
  }
}
```

Without React Proxy:

```js
const rootEl = document.getElementById('root');
React.render(<ComponentVersion1 />, rootEl);

// Will reset state and kill DOM :-(
React.render(<ComponentVersion2 />, rootEl);
```

With React Proxy:

```js
import React from 'react';
import { render } from 'react-dom';
import createProxy from 'react-proxy';
import deepForceUpdate from 'react-deep-force-update';

// Create a proxy object, given the initial React component class.
const proxy = createProxy(ComponentVersion1);

// Obtain a React class that acts exactly like the initial version.
// This is what we'll use in our app instead of the real component class.
const Proxy = proxy.get();

// Render the component (proxy, really).
const rootInstance = render(<Proxy />, rootEl);

// Point the proxy to the new React component class by calling update().
// Instances will stay mounted and their state will be intact, but their methods will be updated.
proxy.update(ComponentVersion2);

// Force-update the whole React component tree.
// Until React provides an official DevTools API to do this,
// you should keep the reference to the root instance(s).
deepForceUpdate(rootInstance);
```

## Features

* Supports both classic (`React.createClass()`) and modern (ES6 classes) style
* Supports inherited and base classes (although you shouldn’t use inheritance with React)
* Supports classic `createClass()` autobinding and modern [`autobind-decorator`](https://github.com/andreypopp/autobind-decorator)
* Contains an extensive test suite to avoid regressions
* Preserves `displayName`
* Preserves enumerability and writability of methods
* Preserves `toString()` of methods
* Replaces instance getters and setters
* Replaces instance methods preserving their identity
* Replaces bound instance methods preserving their identity
* Because identity is preserved, instance methods already scheduled for `setInterval` or `setTimeout` are updated
* Replaces static getters and setters
* Replaces unbound static methods
* Replaces static properties unless they were overwritten by code
* Sets up `this.constructor` to match the most recent class

## Known Limitations

* Does not replace ES7 instance properties
* Replacing a method using [`autobind-decorator`](https://github.com/andreypopp/autobind-decorator) causes its identity to change

## Contributing

1. Clone the repository
2. Run `npm install`
3. Run `npm run test:watch`
4. Take a look at the existing tests
5. Add tests for the failing case you aim to fix and make them pass
6. Submit a PR!

## License

MIT
