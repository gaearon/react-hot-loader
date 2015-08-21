React Proxy
=========

**Work in progress.**

Generic React component proxy.  
A future engine for React Hot Loader. 

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
import { createProxy } from 'react-proxy';

const proxy = createProxy(ComponentVersion1);
const Component = proxy.get();

React.render(<Component />, rootEl);

proxy.update(ComponentVersion2); // will keep the state and DOM
```

## License

MIT
