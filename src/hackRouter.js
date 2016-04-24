const resolveType = require('./resolveType').default;

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
  if (route.component && typeof(route.component) === 'function') {
    // Side effect 😱
    // Force proxies to update since React Router ignores new props.
    resolveType(route.component);
  }

  if (route.components) {
    for (const key in route.components) {
      if (!route.components.hasOwnProperty(key)) continue;

      const component = route.components[key];

      if (typeof(component) === 'function') {
        resolveType(component);
      }
    }
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

export default function hackRouter(type, props) {
  if (isReactRouterish(type) && props) {
    forceUpdateComponentsOfRouteAndChildRoutes(props);
  }
}

module.exports.default = hackRouter;
