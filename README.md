>## A Big Update Is Coming

>React Hot Loader 3 is [on the horizon](https://github.com/gaearon/react-hot-loader/pull/240), and you can try it today ([boilerplate branch](https://github.com/gaearon/react-hot-boilerplate/pull/61), [upgrade example](https://github.com/gaearon/redux-devtools/commit/64f58b7010a1b2a71ad16716eb37ac1031f93915)). It fixes some [long-standing issues](https://twitter.com/dan_abramov/status/722040946075045888) with both React Hot Loader and React Transform, and is intended as a replacement for both. The docs are not there yet, but they will be added before the final release. For now, [this commit](https://github.com/gaearon/redux-devtools/commit/64f58b7010a1b2a71ad16716eb37ac1031f93915) is a good reference.

# React Hot Loader [![npm package](https://img.shields.io/npm/v/react-hot-loader.svg?style=flat-square)](https://www.npmjs.org/package/react-hot-loader)

This is a **stable for daily use in development** implementation of [React live code editing](https://www.youtube.com/watch?v=pw4fKkyPPg8).

* Get inspired by a **[demo video](https://vimeo.com/100010922)** and **[try the live demo](http://gaearon.github.io/react-hot-loader/)**.

* Read **[the integration walkthrough](http://gaearon.github.io/react-hot-loader/getstarted/).**

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

These steps are covered by **[the walkthrough](http://gaearon.github.io/react-hot-loader/getstarted/)**.

If you'd rather stay with **Browserify**, check out **[LiveReactload](https://github.com/milankinen/livereactload)** by Matti Lankinen.

## Flux

**[Redux](https://github.com/gaearon/redux)** is a Flux implementation that supports hot reloading of everything out of the box. Read **[The Evolution of Flux Frameworks](https://medium.com/@dan_abramov/the-evolution-of-flux-frameworks-6c16ad26bb31)** for some context around its creation.

## React Native

React Native **[supports hot reloading natively](https://facebook.github.io/react-native/blog/2016/03/24/introducing-hot-reloading.html)** as of version 0.22.

## Troubleshooting

If something doesn't work, in 99% cases it's a configuration issue. A missing option, a wrong path or port. Webpack is very strict about configuration, and the best way to find out what's wrong is to compare your project to an already working setup, such as **[React Hot Boilerplate](https://github.com/gaearon/react-hot-boilerplate)**, bit by bit. We're also gathering **[Troubleshooting Recipes](https://github.com/gaearon/react-hot-loader/blob/master/docs/Troubleshooting.md)** so send a PR if you have a lesson to share!

## Documentation

Docs are in a bit of a flux right now because I'm in the process of updating everything to document the major 1.0 release.

If you just learned about React Hot Loader and want to find out more, **[check out the walkthrough](http://gaearon.github.io/react-hot-loader/getstarted/)** and then try one of the **[starter kits](https://github.com/gaearon/react-hot-loader/tree/master/docs#starter-kits)**.

If you've been with us for a while, read **[1.0 release notes and migration guide](https://github.com/gaearon/react-hot-loader/blob/master/docs/README.md#migrating-to-10)**.

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
