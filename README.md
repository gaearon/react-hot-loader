# react-hot-loader

This is a **stable for daily use in development** implementation of [React live code editing](http://www.youtube.com/watch?v=pw4fKkyPPg8).

* Get inspired by a **[demo video](https://vimeo.com/100010922).**

* Read **[technical explanation and integration walkthrough](http://gaearon.github.io/react-hot-loader/).**

* Use **one of the [starter kits](https://github.com/gaearon/react-hot-loader/tree/master/docs#starter-kits)** for your next React project.

## Installation

`npm install --save-dev react-hot-loader`

## Usage

#### **[Read the walkthrough!](http://gaearon.github.io/react-hot-loader/#integration)**

Seriously! It covers:

* porting a project to use Webpack;
* enabling Hot Module Replacement;
* integrating react-hot-loader.

### Source Maps

If you use `devtool: 'source-map'` (or its equivalent), source maps will be emitted to hide hot reloading code.

Source maps slow down your project. Use `devtool: 'eval'` for best build performance.

## Running Example

```
npm install
npm start
open http://localhost:8080/webpack-dev-server/bundle
```

Then edit `example/a.jsx` and `example/b.jsx`.
Your changes should be displayed live, without unmounting components or destroying their state.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
