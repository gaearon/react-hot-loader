'use strict';

const React = require('react');
const resolveType = require('./resolveType');

const createElement = React.createElement;
function patchedCreateElement(type, ...args) {
  // Trick React into rendering a proxy so that
  // its state is preserved when the class changes.
  // This will update the proxy if it's for a known type.
  const resolvedType = resolveType(type);
  return createElement(resolvedType, ...args);
}
patchedCreateElement.isPatchedByReactHotLoader = true;

if (!React.createElement.isPatchedByReactHotLoader) {
  React.createElement = patchedCreateElement;
}

