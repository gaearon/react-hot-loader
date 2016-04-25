const React = require('react');
const resolveType = require('./resolveType');
const { isReactRouterish, fixupReactRouter } = require('./fixupReactRouter');

if (React.createElement.isPatchedByReactHotLoader) {
  throw new Error('Cannot patch React twice.');
}

const createElement = React.createElement;
function patchedCreateElement(type, props, ...args) {
  // This is lame but let's focus on shipping.
  // https://github.com/gaearon/react-hot-loader/issues/249
  if (isReactRouterish(type)) {
    fixupReactRouter(props, resolveType);
  }

  // Trick React into rendering a proxy so that
  // its state is preserved when the class changes.
  // This will update the proxy if it's for a known type.
  const resolvedType = resolveType(type);
  return createElement(resolvedType, props, ...args);
}
patchedCreateElement.isPatchedByReactHotLoader = true;
React.createElement = patchedCreateElement;
