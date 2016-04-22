# React Hot Loader 3 [![npm package](https://img.shields.io/npm/v/react-hot-loader.svg?style=flat-square)](https://www.npmjs.org/package/react-hot-loader)

### React Hot Loader 3 has arrived!

It fixes some long-standing issues with both React Hot Loader and React Transform. 

**It is intended as a replacement for both.**

Some nice things about it:

* Editing functional components preserves state
* Works great with higher order components
* Requires little configuration
* Automatically disabled in production
* Works with or without Babel (you can remove `react-hot-loader/babel` from `.babelrc` and instead add `react-hot-loader/webpack` to `loaders`)

Check out [the Migration to 3.0 guide](https://github.com/gaearon/react-hot-loader/tree/master/docs#migration-to-30) to learn how to migrate your app to 3.0.

### Learn

This is a **stable for daily use in development** implementation of [React live code editing](http://www.youtube.com/watch?v=pw4fKkyPPg8).

* Get inspired by a **[demo video](https://vimeo.com/100010922)** and **[try the live demo](http://gaearon.github.io/react-hot-loader/)**.

* Read **[the Getting Started guide](http://gaearon.github.io/react-hot-loader/getstarted/).**

* Use **[one of the starter kits](https://github.com/gaearon/react-hot-loader/tree/master/docs#starter-kits)** for your next React project.

## The Talk

React Hot Loader was demoed together with **[Redux](https://github.com/gaearon/redux)** at React Europe.  
Watch **[Dan Abramov's talk on Hot Reloading with Time Travel](https://www.youtube.com/watch?v=xsSnOQynTHs).**

## Installation

`npm install --save-dev react-hot-loader`

## Usage

If you want to try hot reloading in a new project, try **[one of the starter kits](https://github.com/gaearon/react-hot-loader/tree/master/docs#starter-kits)**, **[React Hot Boilerplate](https://github.com/gaearon/react-hot-boilerplate)** being the most minimal one.

To use React Hot Loader in an existing project, you need to

* switch to Webpack for builds (instead of RequireJS or Browserify);
* enable Hot Module Replacement, which is a Webpack feature;
* configure Webpack to use React Hot Loader for JS or JSX files.

These steps are covered by **[the Getting Started guide](http://gaearon.github.io/react-hot-loader/getstarted/)**.

If you'd rather stay with **Browserify**, check out **[LiveReactload](https://github.com/milankinen/livereactload)** by Matti Lankinen.

## React Native

You can use React Hot Loader to tweak a React Native application. Check out **[react-native-webpack-server](https://github.com/mjohnston/react-native-webpack-server)** by Michael Johnston.

## Troubleshooting

If something doesn't work, in 99% cases it's a configuration issue. A missing option, a wrong path or port. Webpack is very strict about configuration, and the best way to find out what's wrong is to compare your project to an already working setup, such as **[React Hot Boilerplate](https://github.com/gaearon/react-hot-boilerplate)**, bit by bit. We're also gathering **[Troubleshooting Recipes](https://github.com/gaearon/react-hot-loader/blob/master/docs/Troubleshooting.md)** so send a PR if you have a lesson to share!

## Documentation

Docs are in a bit of a flux right now because I'm in the process of updating everything to document the major 1.0 release.

If you just learned about React Hot Loader and want to find out more, **[check out the walkthrough](http://gaearon.github.io/react-hot-loader/getstarted/)** and then try one of the **[starter kits](https://github.com/gaearon/react-hot-loader/tree/master/docs#starter-kits)**.

If you've been with us for a while, read **[1.0 release notes and migration guide](https://github.com/gaearon/react-hot-loader/blob/master/docs/README.md#migrating-to-10)**.

## Got Questions?

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gaearon/react-hot-loader?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Watch the repo to stay tuned!

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
