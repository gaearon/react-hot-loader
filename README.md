# React Hot Loader 3 [![npm package](https://img.shields.io/npm/v/react-hot-loader.svg?style=flat-square)](https://www.npmjs.org/package/react-hot-loader)

### React Hot Loader 3 beta has arrived!

It fixes some long-standing issues with both React Hot Loader and React Transform.

**It is intended as a replacement for both.**

Some nice things about it:

* Editing functional components preserves state
* Works great with higher order components
* Requires little configuration
* Automatically disabled in production
* Works with or without Babel (you can remove `react-hot-loader/babel` from `.babelrc` and instead add `react-hot-loader/webpack` to `loaders`)

Check out [the Migration to 3.0 guide](https://github.com/gaearon/react-hot-loader/tree/master/docs#migration-to-30) to learn how to migrate your app to 3.0.

## Installation

`npm install --save-dev react-hot-loader@next`

## Usage

If you want to try hot reloading in a new project, try **[one of the starter kits](https://github.com/gaearon/react-hot-loader/tree/master/docs#starter-kits)**.

Provided by owner and collaborators:
- **[React Hot Boilerplate](https://github.com/gaearon/react-hot-boilerplate/tree/next)**
- **[React Hot Loader Minimal Boilerplate](https://github.com/wkwiatek/react-hot-loader-minimal-boilerplate)**

To use React Hot Loader in an existing project, you need to

* switch to Webpack for builds (instead of RequireJS or Browserify);
* enable Hot Module Replacement, which is a Webpack feature;
* configure Webpack to use React Hot Loader for JS or JSX files.

These steps are covered by **[the Migration to 3.0 guide](https://github.com/gaearon/react-hot-loader/tree/master/docs#migration-to-30)**.

If you'd rather stay with **Browserify**, check out **[LiveReactload](https://github.com/milankinen/livereactload)** by Matti Lankinen.

## Known limitations

- React Router v3 is not fully supported (e.g. async routes). If you want to get most of React Hot Loader, consider switching to [React Router v4](https://reacttraining.com/react-router/) (Note: it's currently in beta!). If you want to understand the reasoning, it's good to start in [React Router v4 FAQ](https://github.com/ReactTraining/react-router/blob/v4/README.md#v4-faq)

## The Talk

React Hot Loader was demoed together with **[Redux](https://github.com/gaearon/redux)** at React Europe.
Watch **[Dan Abramov's talk on Hot Reloading with Time Travel](https://www.youtube.com/watch?v=xsSnOQynTHs).**

## React Native

React Native **[supports hot reloading natively](https://facebook.github.io/react-native/blog/2016/03/24/introducing-hot-reloading.html)** as of version 0.22.

## Troubleshooting

If something doesn't work, in 99% cases it's a configuration issue. A missing option, a wrong path or port. Webpack is very strict about configuration, and the best way to find out what's wrong is to compare your project to an already working setup, such as **[React Hot Boilerplate](https://github.com/gaearon/react-hot-boilerplate)**, bit by bit. We're also gathering **[Troubleshooting Recipes](https://github.com/gaearon/react-hot-loader/blob/master/docs/Troubleshooting.md)** so send a PR if you have a lesson to share!

## Documentation

Check out the [docs directory](docs).

You can also check out a great [webpack guide to React hot module replacement](https://webpack.js.org/guides/hmr-react/).

## Got Questions?

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gaearon/react-hot-loader?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Watch the repo to stay tuned!

## Patrons

The work on React Hot Loader, [React Transform](https://github.com/gaearon/babel-plugin-react-transform), [Redux](https://github.com/reactjs/redux), and related projects was [funded by the community](https://www.patreon.com/reactdx).
Meet some of the outstanding companies that made it possible:

* [Webflow](https://github.com/webflow)
* [Ximedes](https://www.ximedes.com/)

[See the full list of React Hot Loader patrons.](PATRONS.md)

## License

MIT (https://opensource.org/licenses/mit-license.php)
