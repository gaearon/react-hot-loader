React Hotify
=========

This project is a successor of [React Hot API](https://github.com/gaearon/react-hot-api).  
It has less features and is much less mature.

For now, use at your own risk.  
Read [The Death of React Hot Loader](https://medium.com/@dan_abramov/the-death-of-react-hot-loader-765fa791d7c4) for some context.

### Usage

Annotate component classes with the [decorator](https://github.com/wycats/javascript-decorators) this library exports.
The decorator accepts one parameter: **a string uniquely identifying the given component class in your application.** It should persist between the live edit reloads. For example, you can use the module filename concatenated with the class name.

You should generate these decorator calls (e.g. with a [Babel plugin](https://babeljs.io/docs/usage/plugins/)) so users don't have to write them.

### Examples

#### Webpack

```js
import React from 'react';
import hotify from 'react-hotify'; // Your tool should generate this

@hotify(`${module.id}-Other`) // Your tool should generate this
class Other {
  render() {
    return (
      <h1>hmm.</h1>
    );
  }
}

@hotify(`${module.id}-App`) // Your tool should generate this
export default class App extends React.Component {
  render() {
    return (
      <Other />
    );
  }
}

// Opt-in to Webpack hot module replacement for the module
module.hot.accept(); // Your tool should generate this
```

#### Browserify

???

### Tests

This time, [we've got tests!](https://github.com/gaearon/react-hotify/blob/master/src/__tests__/makeHotify-test.js)

```
npm install
npm test
```

### License

MIT
