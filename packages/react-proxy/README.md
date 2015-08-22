# React Proxy [![build status](https://img.shields.io/travis/gaearon/react-proxy/master.svg?style=flat-square)](https://travis-ci.org/gaearon/react-proxy) [![npm version](https://img.shields.io/npm/v/react-proxy.svg?style=flat-square)](https://www.npmjs.com/package/react-proxy) 

**Work in progress.**

Generic React component proxy.  
A future engine for React Hot Loader. 

## Requirements

* React 0.13+

## Usage

Intended to be used from hot reloading tools like React Hot Loader.  
If you’re an application developer, it’s unlikely you’ll want to use it directly.

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
React.render(<ComponentVersion2 />, rootEl); // will reset state and kill DOM :-(
```

With React Proxy:

```js
import { createProxy, getForceUpdate } from 'react-proxy';

const proxy = createProxy(ComponentVersion1);

const Proxy = proxy.get();
React.render(<Proxy />, rootEl);

// will update the mounted instances' prototypes:
// both DOM and state are perserved.
const mountedInstances = proxy.update(ComponentVersion2);

// works with React Native and non-Component descendants
const forceUpdate = getForceUpdate(React);
mountedInstances.forEach(forceUpdate);
```

## License

MIT
