'use strict';

const React = require('react');
const resolveType = require('./resolveType');

if (React.createElement.isPatchedByReactHotLoader) {
  throw new Error('Cannot patch React twice.');
}

const createElement = React.createElement;
function patchedCreateElement(type, ...args) {
  // Trick React into rendering a proxy so that
  // its state is preserved when the class changes.
  // This will update the proxy if it's for a known type.
  const resolvedType = resolveType(type);
  return createElement(resolvedType, ...args);
}
patchedCreateElement.isPatchedByReactHotLoader = true;
React.createElement = patchedCreateElement;
