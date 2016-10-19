## Known Limitations

### require.ensure
If you want to use Webpack code splitting via `require.ensure`, you'll need to add an additional `module.hot.accept` callback within the `require.ensure` block, like this:

```js
require.ensure([], (require) => {
  if (module.hot) {
    module.hot.accept('../components/App', () => {
      loadComponent(require('../components/App').default);
    })
  }
  loadComponent(require('../components/App').default);
});
```

Note that if you're using React Router (pre-4.0), this will only work with `getChildRoutes`, but not `getComponent`, since `getComponent`'s callback will only load a component once.

### Checking Element `type`s
Because React Hot Loader creates proxied versions of your components, comparing reference types of elements won't work:

```js
const element = <Component />;
console.log(element.type === Component); // false
```

One workaround is to create an element (that will have the `type` of the proxied component):

```js
const ComponentType = (<Component />).type;
const element = <Component />;
console.log(element.type === ComponentType); // true
```

### Reassigning Components
React Hot Loader will only try to reload the original component reference, so if you reassign it to another variable like this:

```js
let App = () => (<div>hello</div>);
App = connect()(App);
export default App;
```

RHL won't reload it. Instead, you'll need to define it once:

```js
const App = () => (<div>hello</div>);
export default connect()(App);
```

### Using Non-Transformed Classes
Unfortunately, right now classes need to be compiled by either Babel or TypeScript to the ES5 equivalent (see [#313](https://github.com/gaearon/react-hot-loader/issues/313)).

### Decorators
Components that are decorated (using something like [`@autobind`](https://github.com/andreypopp/autobind-decorator)) currently do not retain state when being hot-reloaded. (see [#279](https://github.com/gaearon/react-hot-loader/issues/279))
