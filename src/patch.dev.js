const React = require('react');
const resolveType = require('./resolveType');
const hackRouter = require('./hackRouter');

if (React.createElement.isPatchedByReactHotLoader) {
  throw new Error('Cannot patch React twice.');
}

const createElement = React.createElement;
function patchedCreateElement(type, props, ...args) {
  // Ideally we want to teach React Router to receive children.
  // We're not in a perfect world, and a dirty workaround works for now.
  // https://github.com/reactjs/react-router/issues/2182
  hackRouter(type, props, resolveType);

  // Trick React into rendering a proxy so that
  // its state is preserved when the class changes.
  // This will update the proxy if it's for a known type.
  const resolvedType = resolveType(type);
  return createElement(resolvedType, props, ...args);
}
patchedCreateElement.isPatchedByReactHotLoader = true;
React.createElement = patchedCreateElement;
