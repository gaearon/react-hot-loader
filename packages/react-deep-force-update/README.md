react-deep-force-update
=========================

[![build status](https://img.shields.io/travis/gaearon/react-deep-force-update/master.svg?style=flat-square)](https://travis-ci.org/gaearon/react-deep-force-update) 
[![npm version](https://img.shields.io/npm/v/react-deep-force-update.svg?style=flat-square)](https://www.npmjs.com/package/react-deep-force-update) 
[![npm downloads](https://img.shields.io/npm/dm/react-deep-force-update.svg?style=flat-square)](https://www.npmjs.com/package/react-deep-force-update)

Force-updates React component tree recursively.

**Don’t use this in your application code!**

You’ll only need this if you’re writing a React development tool and you want to enforce a deep update regardless of what component classes have to say.

## Installation

```
npm install --save react-deep-force-update
```

Requires React 0.14 and newer.

## Usage

```js
import React from 'react';
import { render } from 'react-dom';
import deepForceUpdate from 'react-deep-force-update';

const instance = render(<Something />);

// Will force-update the whole rendered tree
// even if components in the middle of it
// define a strict shouldComponentUpdate().
deepForceUpdate(instance);
```

## React Native

This will work with React Native when [facebook/react-native#2985](https://github.com/facebook/react-native/issues/2985) lands.  
For now, you can keep using 1.x.

## Credits

This project is based on the [code written by @syranide](https://github.com/gaearon/react-hot-api/commit/b3d6059a17407ef44765814ce06b36716d110041).

## License

MIT
