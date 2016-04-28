'use strict';

import { Children, isValidElement } from 'react';

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
  return ensureArray(routes)
    .filter(Boolean)
    .map(route => {
      const isElement = isValidElement(route);
      const component = isElement ? route.props.component : route.component;
      const namedComponentsByKey = isElement ? route.props.components : route.components;

      const indexRoute = route.indexRoute;
      const childRoutes = isElement ?
        Children.toArray(route.props.children) :
        ensureArray(route.childRoutes);
      const namedComponents = Object.keys(namedComponentsByKey || {}).map(key =>
        namedComponentsByKey[key]
      );

      const indexRouteComponents = indexRoute && extractComponents(indexRoute);
      const childRouteComponents = childRoutes && extractComponents(childRoutes);
      return [].concat(
        component,
        namedComponents,
        indexRouteComponents,
        childRouteComponents
      );
    })
    .reduce((flattened, candidates) => flattened.concat(candidates), [])
    .filter(c => typeof c === 'function');
}

function extractRouteHandlerComponents(props) {
  const routes = props.routes || Children.toArray(props.children);
  return extractComponents(routes);
}

module.exports = {
  isReactRouterish,
  extractRouteHandlerComponents
};
