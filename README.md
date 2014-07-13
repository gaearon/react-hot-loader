# react-hot-loader

This is a **highly experimental** proof of concept of [React live code editing](http://www.youtube.com/watch?v=pw4fKkyPPg8).  
It marries React with Webpack [Hot Module Replacement](http://webpack.github.io/docs/hot-module-replacement.html) by monkeypatching `React.createClass`.  

Inspired by [react-proxy-loader](https://github.com/webpack/react-proxy-loader).

### Running Example

```
npm install
cd example
webpack-dev-server --hot
open http://localhost:8080/webpack-dev-server/bundle
```

Then edit `example/a.jsx` and `example/b.jsx`.  
Your changes should be displayed live, without unmounting components or destroying their state.

### Limitations

* You have to include component's displayName in `require` call

### Implementation Notes

Currently, it keeps a list of mounted instances and updates their prototypes when an update comes in.  
A better approach may be to make monkeypatch `createClass` to return a proxy object [as suggested by Pete Hunt](https://github.com/webpack/webpack/issues/341#issuecomment-48372300):

>The problem is that references to component descriptors could be stored in any number of places. What we could do is wrap all components in "proxy" components which look up the "real" component in some mapping


## Installation

`npm install react-hot-loader`

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

```javascript
// Currently you have to pass displayName to require call:
var Button = require('react-hot?Button!./button');
```

When a component is imported that way, changes to its code should be applied **without unmounting it or losing its state**.

# License

MIT (http://www.opensource.org/licenses/mit-license.php)
