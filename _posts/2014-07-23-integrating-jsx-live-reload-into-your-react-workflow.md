---
layout: post
title: "Integrating JSX live reload into your React workflow"
---

Do you want [Bret Victoresque](http://vimeo.com/36579366) live reload for your React app as you edit it?

<iframe src="//player.vimeo.com/video/100010922" width="800" height="461" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

Meet **[react-hot-loader](https://github.com/gaearon/react-hot-loader)**, a drop-in Webpack [loader](http://webpack.github.io/docs/loaders.html) you can use to **enable live editing for React components in your projects.** No browser plugins or IDE hooks required.

It marries Webpack Hot Module Replacement (HMR) with React.

You can use this if:

* Your React components donʼt have nasty side-effects;
* Youʼre willing to switch to [Webpack](https://github.com/webpack/webpack) for modules[^1];
* You have a spare couple of hours (minutes if you use Webpack).

Donʼt worry if you donʼt know what Webpack is. In **[Integration](#integration)** section, Iʼll guide you through integrating this into the [official React tutorial](http://facebook.github.io/react/docs/tutorial.html) app. The steps to get this goodness into your project should roughly be the same.

------

<h2 id="not-magic">Part 1. Itʼs Not Magic</h2>

This part explains how react-hot-loader works.  
**If you donʼt care and want to start using it now, [skip this part](#integration).**

### What Is Hot Module Replacement?

A few weeks ago, while porting Stampsy from RequireJS to Webpack, I discovered that Webpack supports something called [Hot Module Replacement](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html):

>Hot Module Replacement (HMR) is a way of exchanging modules in a running application (and adding/removing modules). You can update changed modules without a full page reload.

Basically, it is an opt-in feature of Webpack that allows each module to specify custom behavior (by default Webpack reloads the page) when a newer version of itself or its dependencies is available (i.e. when you save a file in the editor). It works together with a dev server, such as [webpack-dev-server](http://webpack.github.io/docs/webpack-dev-server.html).

Right now it only makes sense for development setup so weʼll disable this feature in production builds. Theoretically in the future we can use HMR to implement continous deployment, but this is crazy and we wonʼt get into this today.

When a source file changes, webpack-dev-server tells the Webpack runtime (which is small and included in the generated bundle) that an update to some module is available. Webpack runtime then asks the updated module whether it can accept updates, going up the dependency chain. **If any of modules in chain declare that they *know* how to handle an update by registering a handler, Webpack will invoke it instead of reloading the page.**

### Hot Module Replacement by Example

Webpackʼs [style-loader](https://github.com/webpack/style-loader) uses HMR API to [replace `<style>` tag](https://github.com/webpack/docs/wiki/hot-module-replacement#example-2-hot-replace-css) when CSS file changes. This gives you LiveReload-like experience. But HMR is much more than that, because it can be used for any kind of module, including JS, as long as you can handle an update in a way that makes sense for your application.

Say we have `parentModule` that depends on `a` and `b`:

{% highlight js %}
// parentModule.js

var a = require('./a');
var b = require('./b');

// ... your module code ...

// In production, `module.hot` is `false` and condition is cut:
if (module.hot) {

  // This is where we can call HMR API (module.hot)
  // and register update handlers for dependencies.

  // Means "I know what to do when ./a changes!"
  module.hot.accept('./a', function () {

    console.log('My dependency changed!');
    console.log('I gotta do something with the new version');

    // It makes sense to update the variable.
    // require will now return the fresh version:
    a = require('./a');

    // You'll probably want to do something else too,
    // depending on the nature of dependency and its side-effects:

    // * Re-render the view?
    // * Recreate or reassign some objects?
    // * Give up and reload? (default if you omit this handler)
  });

}
{% endhighlight %}

If you run Webpack server with HMR enabled and edit `a.js`, instead of reloading the page, Webpack will invoke your callback. Doing `require('./a')` inside this callback will give you an updated version of `a.js`, and itʼs up to you to do something with it. However, if you edit `b.js`, Webpack wonʼt find any HMR handler and will fallback to reloading the page.

Finally, updates bubble up the dependency hierarchy so if somebody `accept`s `parentModule` itself, editing `a` or `b` will not cause a reload. We can say that module updates bubble similarly to browser events, and `module.hot.accept` acts like `stopPropagation` and `preventDefault`, preventing the “default action” of refreshing.

Thatʼs the gist of how HMR works. Of all HMR API I only ever used [`accept`](http://webpack.github.io/docs/hot-module-replacement.html#accept). [This article](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html) gives you a broader look at what HMR is from the point of view of the app, compiler, HMR runtime and modules.

### Where React Comes In

This is useful to an extent, but you still need to write `accept` handlers, and you wouldnʼt want this kind of code bloat in every module. Moreover, it may be very hard to write correct `accept` code, since youʼd need to write update each moduleʼs dependencies and somehow selectively re-render the app with the new code.

We *could* make this work but only if the UI framework we used offered a deterministic view lifecycle and could re-render certain parts of the app without throwing the DOM or the state away. Oh wait… Here comes React, right?

When an update for a module with a React component comes in, we can patch the prototype of the existing component with new prototype (that has fresh `render` and other methods), and then call `forceUpdate` on all mounted instances. This will keep componentʼs state and, thanks to Reactʼs reconciliation algorithm, apply the minimal set of updates from what previous version of `render` returned.

It would be a chore if we had to do this for every component manually, but thatʼs what [react-hot-loader](https://github.com/gaearon/react-hot-loader) is for! **It handles HMR business for your React components.**

---------

<h2 id="integration">Part 2. Integration</h2>

This part explains how to integrate React live reload into your project.  
**If you donʼt like magic, [read how it works](#not-magic) and [look at the source](https://github.com/gaearon/react-hot-loader).**  

# TODO

---------

## Credits

This wouldnʼt be possible without help of these people:

* [Pete Hunt](http://github.com/petehunt) for React and dropping by every now and then;
* [Tobias Koppers](http://github.com/sokra) for Webpack, [react-proxy-loader](http://github.com/sokra/react-proxy-loader) and explanations;
* [Johannes Lumpe](http://github.com/johanneslumpe) and [Ben Alpert](http://github.com/spicyj) on `#reactjs` for suggesting to mess with component spec and wrap prototype methods;
* Bret Victor for making me think live editing should be the norm, although he probably hates what people do after watching his videos.

## Footnotes

[^1]: Converting to Webpack from RequireJS or Browserify is straightforward because Webpack supports all module styles (AMD and CommonJS, as well as careless globals with [imports-loader](https://github.com/webpack/imports-loader) and [exports-loader](https://github.com/webpack/exports-loader)), can `watch` with fast incremental updates, compile to a single file or even to several chunks. Everything that RequireJS or Browserify can do, Webpack does better. My only gripe with Webpack is documentation being too dense, but this is being addressed. See [Pete Huntʼs no-bullshit intro to Webpack](https://github.com/petehunt/webpack-howto).
