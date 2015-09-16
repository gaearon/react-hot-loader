react-deep-force-update
=========================

Force-updates React component tree recursively. **Don’t use this in your application code!** You’ll only need this if you’re writing a React development tool or library like [React Proxy](https://github.com/gaearon/react-proxy) and you want to enforce a deep update regardless of what component classes have to say.

## Installation

```
npm install --save react-deep-force-update
```

## Usage

```js
import React from 'react'; // or 'react-native'
import getDeepForceUpdate from 'react-deep-force-update';

const deepForceUpdate = getDeepForceUpdate(React);
const instance = React.render(<Something />);

// Will force-update the whole rendered tree
// even if components in the middle of it
// define a strict shouldComponentUpdate().
deepForceUpdate(instance);
```

## License

MIT
