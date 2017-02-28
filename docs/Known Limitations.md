## Known Limitations

### Code Splitting
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

Also, if you're using the Webpack 2 beta, you can use `System.import` without extra `module.hot.accept` calls, although there are still a [few issues with it](https://github.com/gaearon/react-hot-loader/issues/303).

### Checking Element `type`s
Because React Hot Loader creates proxied versions of your components, comparing reference types of elements won't work:

```jsx
const element = <Component />;
console.log(element.type === Component); // false
```

One workaround is to create an element (that will have the `type` of the proxied component):

```jsx
const ComponentType = (<Component />).type;
const element = <Component />;
console.log(element.type === ComponentType); // true
```

You can also set a property on the component class:

```jsx
const Widget = () => <div>hi</div>;
Widget.isWidgetType = true;
console.log(<Widget />.type.isWidgetType); // true
```

### Reassigning Components
React Hot Loader will only try to reload the original component reference, so if you reassign it to another variable like this:

```jsx
let App = () => (<div>hello</div>);
App = connect()(App);
export default App;
```

React Hot Loader won't reload it. Instead, you'll need to define it once:

```jsx
const App = () => (<div>hello</div>);
export default connect()(App);
```

### Decorators
Components that are decorated (using something like [`@autobind`](https://github.com/andreypopp/autobind-decorator)) currently do not retain state when being hot-reloaded. (see [#279](https://github.com/gaearon/react-hot-loader/issues/279))
