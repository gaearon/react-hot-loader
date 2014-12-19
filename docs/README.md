### Starter Kits

* [react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate) (Bare minimum)
* [react-starter](https://github.com/webpack/react-starter) (react-router, includes production configs)
* [isomorphic-hot-loader](https://github.com/irvinebroque/isomorphic-hot-loader) (react-router, isomorphic)
* [isomorphic-react-template](https://github.com/gpbl/isomorphic-react-template/) (react-router, isomorphic)
* [coffee-react-quickstart](https://github.com/KyleAMathews/coffee-react-quickstart) (react-router, CoffeeScript, Gulp)

Don't be shy, add your own.

### Migrating to 1.0

React Hot Loader has reached 1.0, and it's a breaking change.  
Here's what changed:

TODO


### Miscellaneous

#### Source Maps

If you use `devtool: 'source-map'` (or its equivalent), source maps will be emitted to hide hot reloading code.

Source maps slow down your project. Use `devtool: 'eval'` for best build performance.

Hot reloading code is just one line in the beginning and one line in the end of each module so you might not need source maps at all.
