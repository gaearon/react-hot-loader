const React = require('react');
const createProxy = require('react-proxy').default;

function setFlag(obj, key) {
  try {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: false,
      value: true
    });
  } catch (err) {}
}

let proxies = {};
let warnedAboutTypes = {};
function resolveType(type) {
  // We only care about composite components
  if (!type || typeof type === 'string') {
    return type;
  }

  // If the type is not tagged, return it as is.
  if (
    !Object.hasOwnProperty.call(type, '__source') ||
    !type.__source ||
    !type.__source.fileName ||
    !type.__source.localName
  ) {
    setFlag(type, '__noSourceFound');
    return type;
  }

  // Uniquely identifiy the component in code across reloads.
  const source = type.__source;
  const id = source.fileName + '#' + source.localName;

  if (type.hasOwnProperty('__noSourceFound')) {
    // This component didn't have a source last time, but now it has?
    // This means createElement() was called during module definition.
    // Bail out, or the component will be unmounted unexpectedly this time,
    // as we'll return proxy but we returned the original class the last time.
    // https://github.com/gaearon/react-hot-loader/issues/241
    if (!warnedAboutTypes[id]) {
      warnedAboutTypes[id] = true;
      console.error(
        `React Hot Loader: ${source.localName} from ${source.fileName} will not ` +
        `hot reload correctly because it contains an imperative call like ` +
        `ReactDOM.render() in the same file. Split ${source.localName} into a ` +
        `separate file for hot reloading to work.`
      );
    }
    return type;
  }

  // We use React Proxy to generate classes that behave almost
  // the same way as the original classes but are updatable with
  // new versions without destroying original instances.
  if (!proxies[id]) {
    proxies[id] = createProxy(type);
  } else if (!type.hasOwnProperty('__hasBeenUsedForProxy')) {
    proxies[id].update(type);
  }
  // Don't update proxy with the same class.
  // This makes sure stale old classes never revive.
  // https://github.com/gaearon/react-hot-loader/issues/248
  setFlag(type, '__hasBeenUsedForProxy');

  // Give proxy class to React instead of the real class.
  return proxies[id].get();
}

if (React.createElement.isPatchedByReactHotLoader) {
  throw new Error('Cannot patch React twice.');
}

// This is lame but let's focus on shipping.
// https://github.com/gaearon/react-hot-loader/issues/249
function isReactRouterish(type) {
  return type && (
    type.displayName === 'Router' ||
    type.name === 'Router' // In case Ryan and Michael embrace ES6 classes
  );
}

function forceUpdateComponentsOfRouteAndChildRoutes(route) {
  // TODO: check whether it is possible to also handle the `getComponent` case here
  if (route.component && typeof route.component === 'function') {
    // Side effect 😱
    // Force proxies to update since React Router ignores new props.
    resolveType(route.component);
  }

  // Child routes will be in `children` when defining routes using react
  // elements and in `routes` or `childRoutes` when using plain routes
  const childRoutes = []
    .concat(route.routes, route.childRoutes, route.children)
    .filter(Boolean);

  for (const childRoute of childRoutes) {
    // When using `Route` element routes the relevant objects will be under props
    // and when using plain routes directly on the route
    forceUpdateComponentsOfRouteAndChildRoutes(childRoute.props || childRoute);
  }
}

const createElement = React.createElement;
function patchedCreateElement(type, props, ...args) {
  // Ideally we want to teach React Router to receive children.
  // We're not in a perfect world, and a dirty workaround works for now.
  // https://github.com/reactjs/react-router/issues/2182
  if (isReactRouterish(type) && props) {
    forceUpdateComponentsOfRouteAndChildRoutes(props);
  }

  // Trick React into rendering a proxy so that
  // its state is preserved when the class changes.
  // This will update the proxy if it's for a known type.
  const resolvedType = resolveType(type);
  return createElement(resolvedType, props, ...args);
}
patchedCreateElement.isPatchedByReactHotLoader = true;
React.createElement = patchedCreateElement;
