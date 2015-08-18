React Patch
=========

**Work in progress.**

Generic React component patcher.  
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

Without React Patch:

```js
const rootEl = document.getElementById('root');
React.render(<ComponentVersion1 />, rootEl);
React.render(<ComponentVersion2 />, rootEl); // will reset state and kill DOM :-(
```

With React Patch:

```js
import { createPatch } from 'react-patch';
const patch = createPatch();

const PatchedComponentVersion1 = patch(ComponentVersion1);
React.render(<PatchedComponentVersion1 />, rootEl);

patch(ComponentVersion2); // will keep the state and DOM
```

## License

MIT
