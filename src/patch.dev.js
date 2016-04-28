'use strict';

const React = require('react');
const resolveType = require('./resolveType');
const { isReactRouterish, extractRouteHandlerComponents } = require('./fixupReactRouter');

if (React.createElement.isPatchedByReactHotLoader) {
  throw new Error('Cannot patch React twice.');
}

const createElement = React.createElement;
function patchedCreateElement(type, props, ...args) {
  // Trick React into rendering a proxy so that
  // its state is preserved when the class changes.
  // This will update the proxy if it's for a known type.
  const resolvedType = resolveType(type);
  const element = createElement(resolvedType, props, ...args);

  // This is lame but let's focus on shipping.
  // https://github.com/gaearon/react-hot-loader/issues/249
  if (isReactRouterish(type)) {
    // Ideally we want to teach React Router to receive children.
    // We're not in a perfect world, and a dirty workaround works for now.
    // https://github.com/reactjs/react-router/issues/2182
    const resolvedProps = element.props;
    const routeHandlers = extractRouteHandlerComponents(resolvedProps, resolveType);
    // Side effect 😱
    // Force proxies to update since React Router ignores new props.
    routeHandlers.forEach(resolveType);
  }

  return element;
}
patchedCreateElement.isPatchedByReactHotLoader = true;
React.createElement = patchedCreateElement;
