### Starter Kits

Don't be shy, add your own.

#### React-Hot-Loader v3
* [react-hot-boilerplate/next](https://github.com/gaearon/react-hot-boilerplate/tree/next) (Bare minimum)
* [webpack-react-redux](https://github.com/jpsierens/webpack-react-redux) (redux, react-router, hmr)
* [react-lego](https://github.com/peter-mouland/react-lego) (universal, react-router, other optional techs)
* [react-static-boilerplate](https://github.com/koistya/react-static-boilerplate) (static site generator; React, PostCSS, Webpack, BrowserSync)
* [react-cool-starter](https://github.com/wellyshen/react-cool-starter) (universal, redux, react-router, webpack 2, Babel, PostCSS, and more...)
* [react-redux-saga-boilerplate](https://github.com/gilbarbara/react-redux-saga-boilerplate) (react-router, redux, saga, webpack 2, jest w/ coverage, enzyme)
* [react-universal-boiler](https://github.com/strues/react-universal-boiler) (webpack 2, universal, react-router, redux, happypack)
* [apollo-fullstack-starter-kit](https://github.com/sysgears/apollo-fullstack-starter-kit) (universal, apollo, graphql, react, react-router, knex)
* [react-universally](https://github.com/ctrlplusb/react-universally) (universal, react, react router, express, seo, full stack webpack 2, babel)
* [meatier](https://github.com/mattkrick/meatier) (webpack 2 + hmr, universal, redux, graphql, react, react-router-redux, ssr)
* [react-hot-ts](https://github.com/Glavin001/react-hot-ts) (React, Webpack, TypeScript)
* [react-boilerplate-app](https://github.com/vebjorni/react-boilerplate-app) (react (duh), router, webpack with dev server, babel, hot reloading)

#### React-Hot-Loader v1

* [react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate) (Bare minimum)
* [react-starter](https://github.com/webpack/react-starter) (react-router, includes production configs)
* [react-webpack-babel](https://github.com/alicoding/react-webpack-babel) (react+babel+webpack, simple and clean, production config)
* [react-tape](https://github.com/fc-io/react-tape) (Babel, blue-tape, css-loader, html-webpack-plugin, production config)
* [isomorphic-hot-loader](https://github.com/irvinebroque/isomorphic-hot-loader) (react-router, isomorphic)
* [isomorphic-react-template](https://github.com/gpbl/isomorphic-react-template/) (react-router, isomorphic)
* [coffee-react-quickstart](https://github.com/KyleAMathews/coffee-react-quickstart) (react-router, CoffeeScript, Gulp)
* [boilerplate-webpack-react](https://github.com/tcoopman/boilerplate-webpack-react) (react-router, isomorphic)
* [react-web](https://github.com/darul75/web-react) (Babel, react-router, Alt flux)
* [react-webpack-boilerplate](https://github.com/srn/react-webpack-boilerplate) (One-click Heroku deployable, Node.js server)
* [react-fullstack-skeleton](https://github.com/fortruce/react-fullstack-skeleton) (react w/ backend api server)
* [react-hot-boilerplate-ts](https://github.com/wmaurer/react-hot-boilerplate-ts) (hot reloadable typescript starter kit)
* [Megatome](https://github.com/Levelmoney/generator-megatome) (Yeoman generator w/ dynamic switchable rendering on Node/browser, react-router, babel, isomophic, an easy config building environments, bring-your-own-data-model and docker)
* [react-webpack-template](https://github.com/weblogixx/react-webpack-template) (Babel, Karma + Mocha + Istanbul Coverage, prepared for usage of Less/Sass/Stylus/PostCSS and CSSModules)


### Migrating to 1.0

React Hot Loader has reached 1.0, and it's a breaking change. When React Hot Loader just started, it used a regex to find `createClass` calls and replace them with its own implementation. This turned out to be a bad idea for a number of reasons:

* Doesn't work when components are created through wrappers (e.g. [OmniscientJS](http://omniscientjs.github.io));
* Doesn't work when author calls React differently;
* Causes false positives in React source code comments and elsewhere;
* Most importantly, won't work with ES6 classes that will be future of React.

Here's how we're solving these problems in 1.0:

#### Only `module.exports` and its own properties are hot by default

With 1.0, we no longer parse your sources. Instead, we only now make `module.exports` and its [own properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty) hot by default, and only if their prototype declares `render` method or descends from `React.Component`. **If you've been splitting each component in a separate file, that means no change for you here!** This allows us to support exotic wrappers.

If you use inheritance in React 0.13, base classes will only be opted into hot reloading if they descend from `React.Component` or define `render` method. Otherwise you need to explicitly call `module.makeHot` as described below.

#### You can make hot anything else via opt-in `module.makeHot` API

But what if you *want* to have several hot-reloadable components in one file? Or what if you want to export a function creating components, or an object with several components as properties? For that, 1.0 **adds first public API to hot loader: `module.makeHot`**. This method will be present on `module` object if hot loader is enabled, and allows you to make any component hot:

```js
var Something = React.createClass({
  ...
};

if (module.makeHot) { // Won't be true in production
  Something = module.makeHot(Something);
}
```

Explicit API can also be used inside functions:

```js
function generateClass(param) {
  var Class = return React.createClass({
    ...
  };

  if (module.makeHot) {
    Class = module.makeHot(Class, param);
  }

  return Class;
}

```

Note the second parameter: `makeHot` needs some way to distinguish components of same type inside on module. By default, it uses `displayName` of given component class, but in case of dynamically generated classes (or if you're not using JSX), you have to provide it yourself.

### Manual mode (experimental)

You can now use `react-hot?manual` instead of `react-hot` in Webpack config to turn on manual mode. In manual mode, “accepting” hot updates is up to you; modules won't accept themselves automatically. This can be used, for example, to put reloading logic on very top of the application and [hot-reload routes as well as components](https://github.com/rackt/react-router/pull/606#issuecomment-66936975). It will also work better when you have a lot of modules that export component-generating functions because updates will propagate to the top. (Don't worry if you don't understand this; it's just something experimental you might want to try to integrate hot reloading deeper into your app.)

### Usage with external React

If you're using external standalone React bundle instead of NPM package, Hot Loader will fail because it relies on `react/lib/ReactMount` which is not exposed in precompiled React. It needs `ReactMount` to keep track of mounted React component instances on the page. However, you can supply your own root instance provider:

```js
// Your app's index.js

var React = require('react'),
    router = require('./router');

var rootInstance = null;

router.run(function (Handler, state) {
  rootInstance = React.render(<Handler />, document.body);
});

if (module.hot) {
  require('react-hot-loader/Injection').RootInstanceProvider.injectProvider({
    getRootInstances: function () {
      // Help React Hot Loader figure out the root component instances on the page:
      return [rootInstance];
    }
  });
}
```

You'll only need this if you [use a precompiled version of React](https://github.com/gaearon/react-hot-loader/issues/53). If you use React NPM package, this is not necessary. You should generally use React NPM package unless you have good reason not to.

### Source Maps

If you use `devtool: 'source-map'` (or its equivalent), source maps will be emitted to hide hot reloading code.

Source maps slow down your project. Use `devtool: 'eval'` for best build performance.

Hot reloading code is just one line in the beginning and one line in the end of each module so you might not need source maps at all.

### React Hot API

If you're authoring a build tool, you might be interested to hear that React Hot Loader brains have been extracted into runtime-agnostic [React Hot API](https://github.com/gaearon/react-hot-api). React Hot Loader just binds that API to Webpack runtime, but you can implement yours too.
