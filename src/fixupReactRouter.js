
function ensureArray(maybeArray) {
  if (!maybeArray) {
    return [];
  } else {
    if (Array.isArray(maybeArray)) {
      return maybeArray;
    } else {
      return [maybeArray];
    }
  }
}

function isReactRouterish(type) {
  return type && (
    type.displayName === 'Router' ||
    type.name === 'Router' // In case Ryan and Michael embrace ES6 classes
  );
}

function extractComponents(routes) {
  return routes
    .map(route => {
      // The route properties are at different locations depending on if plain routes
      // or regular element routes are used
      const component = route.component || (route.props && route.props.component);
      const componentsMap = route.components || (route.props && route.props.components) || {};
      const childRoutes = route.childRoutes || (route.props && ensureArray(route.props.children));

      const components = Object.keys(componentsMap).map(key => componentsMap[key]);
      const childRouteComponents = childRoutes && extractComponents(childRoutes);

      return [].concat(component, components, childRouteComponents);
    })
    .reduce((reduceTarget, components) => reduceTarget.concat(components), []) // flatten
    .filter(c => typeof(c) === 'function');
}

function fixupReactRouter(props, forceUpdateFunction) {
  // Ideally we want to teach React Router to receive children.
  // We're not in a perfect world, and a dirty workaround works for now.
  // https://github.com/reactjs/react-router/issues/2182
  const routes = props.routes || ensureArray(props.children);
  const components = extractComponents(routes);
  components.forEach((component) =>  {
    // Side effect 😱
    // Force proxies to update since React Router ignores new props.
    forceUpdateFunction(component);
  });
}

module.exports = { isReactRouterish, fixupReactRouter };
