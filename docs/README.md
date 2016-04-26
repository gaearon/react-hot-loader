# React Hot Loader v3

**_Draft docs_**

## Intro

React Hot Loader lets us modify our React components and see the changes in realtime.  No more waiting for your entire project to rebuild every time you save a file; your webpage stays loaded and the modified component updates instantly.

XXX do we even need an intro here?  What will be here vs main README?  e.g.
*   animated gif (should definitely be main README)
*   link to reacteurope video

**Differences from Past Approaches and Issues Solved**

First we had React Hot Loader, which was superseded by React Transform.  Each time we solved earlier issues but were faced with new ones.  RHLv3 solves all these issues with a more sustainable approach, and is intended as a replacement for both:

*   Preserves state in functional components
*   Little configuration required
*   Disabled in production
*   Works with or without Babel
*   Everything you need in a single repo

For more information on the evolution of approaches taken, see [](https://medium.com/@dan_abramov/hot-reloading-in-react-1140438583bf)https://medium.com/@dan_abramov/hot-reloading-in-react-1140438583bf.

## Boilerplate Example

What follows is a 3-step guide to integrating React Hot Loader into your current project.  Alternatively, you can also clone the boilerplate, for a quick start on a fresh app with everything working out-of-the-box.

[](https://github.com/gaearon/react-hot-boilerplate/)https://github.com/gaearon/react-hot-boilerplate/

### Starter Kits

**XXX: from old doc, but we only want ones that are up to date with RHLv3**

## Integrating into your own App

### Step 1/3: Enabling Hot Module Replacement (HMR)

HMR allows us to replace modules in-place without restarting the server, here's how you can enable it:

**Webpack**

* Create a development Webpack config separate from production one
* Add HotModuleReplacementPlugin to development Webpack config
* If you only render on the client, consider using WebpackDevServer
  * Easier to set up
  * Enable hot: true and add its entry points
* If you use server rendering, consider using Express server + webpack-dev-middleware
* More work but also more control
* Show how to add webpack-dev-middleware and its entry point

**XXX cleanup, details**

**Browserify**

If you have this setup working, please consider submitting instructions as a PR.

**Meteor**

*   If you're using [webpack:webpack](https://atmospherejs.com/webpack/webpack) you can follow the webpack instructions or ask for help in [this](https://forums.meteor.com/t/use-webpack-with-meteor-simply-by-adding-packages-meteor-webpack-1-0-is-out/18819) forum post.

*   Otherwise, for HMR in "native" Meteor, type: `meteor remove ecmascript && meteor add gadicc:ecmascript-hot` or see the [README](https://github.com/gadicc/meteor-react-hotloader#readme) for more details.  There are also some Meteor-specific RHLv3 install instructions [here](https://github.com/gadicc/meteor-react-hotloader/blob/master/docs/React_Hotloading.md).

### Step 2/3: Using HMR to replace the root component

When the HMR runtime receives an updated module, it first checks to see if the module knows how to update itself, and then ascends the import/require chain looking for a parent module that can accept the update.  We want our root component to be able to accept an update from any child component.

If your client entry point looks like this:

```js
import React from 'react';
import { render } from 'react-dom';
import RootContainer from './containers/rootContainer.js';

render(<RootContainer />, document.elementById('react-root'));
```
you would add the following code to accept changes to RootContainer _or any of it's descendants_.

```js
 if (module.hot) {
   module.hot.accept('./containers/rootContainer.js', function() {
     var NextRootContainer = require('./containers/rootContainer.js').default;
     render(<NextRootContainer />, document.elementById('react-root'));
   }
 }
```
Note, with no further steps, this enough to hotload changes to React components, but state will not be preserved.  If you externalize all your state in a state store like Redux, this might be enough.

### Step 3/3: Adding React Hot Loader to preserve state

The final step adds adds `react-hot-loader` to our project to preserve _component state_ across hot loads.

1.  Install the package:

    ```sh
    npm install --save-dev react-hot-loader
    ```
1.  Add the package to your config.

    a.  If you use Babel, modify your `.babelrc` to ensure it includes at least:

    ```js
    {
      "plugins": [ "react-hot-loader/babel" ]
    }
    ```
    b. Alternatively, in Webpack, add `react-hot-loader/webpack` to your loaders

    ```js
        XXX
    ```

1.  Add following line to the top of your main entry point:
    ```js
    import 'react-hot-loader/patch';
    ```

1.  Wrap your `<RootContainer/>` inside of an `<AppContainer>`:

    ```js
    import { AppContainer } from 'react-hot-loader';
    render(<AppContainer><RootContainer /></AppContainer>,
      document.getElementById('react-root'));
    ```  
    **XXX pending [gaearon/react hot loader#244](https://github.com/gaearon/react-hot-loader/issues/244)**

    You should do this for both instances, e.g. your original mount and your mount code inside of the `module.hot.accept()` function.  `<AppContainer>` must wrap only a single, React component.

That's it!

## Putting it all together 

If you followed all the steps your app's main entry point should now look something like this:

```js
import 'react-hot-loader/patch';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import RootContainer from './containers/rootContainer.js';

render(<AppContainer><RootContainer /></AppContainer>,
  document.getElementById('react-root');

if (module.hot) {
  module.hot.accept('./containers/rootContainer.js', function() {
    var NextRootContainer = require('./containers/rootContainer.js').default;
    render(<AppContainer><NextRootContainer /></AppContainer>,
      document.getElementById('react-root'));
   }
}
```

### Checking that everything is working properly

**XXX**

## Troubleshooting

**XXX could/should be in another file**

## Tips and Tricks

**XXX could/should be in another file**

**How to get an error in your console too:**

The redbox errors are great to clearly see rendering issues, and avoiding an uncaught error from breaking your app.  But there are some advantages to a thrown error in the console too, like filename resolution via sourcemaps, and click-to-open.  To get the best of both worlds, modify your app entry point as follows:

```js
import Redbox from 'redbox-react';

const consoleErrorReporter = ({error}) => {
  // We throw in a different context, so the app still doesn't break!
  setTimeout(() => { throw error; });
  return <Redbox error={error} />;
};
consoleErrorReporter.propTypes = {
  error: React.PropTypes.error
};

render(
  <AppContainer errorReporter={consoleErrorReporter}>
    <AppRoot />
  </AppContainer>,
  document.getElementById('react-root')
);
```

## Where to ask for Help

**XXX**