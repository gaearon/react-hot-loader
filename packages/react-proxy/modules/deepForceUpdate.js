'use strict';

var bindAutoBindMethods = require('./bindAutoBindMethods');

/**
 * Updates a React component recursively, so even if children define funky
 * `shouldComponentUpdate`, they are forced to re-render.
 * Makes sure that any newly added methods are properly auto-bound.
 */
function deepForceUpdate(component) {
  if (component._instance) {
    // React 0.13
    component = component._instance;
  }

  bindAutoBindMethods(component);

  if (component.forceUpdate) {
    component.forceUpdate();
  }

  if (component._renderedComponent) {
    deepForceUpdate(component._renderedComponent);
  }

  for (var key in component._renderedChildren) {
    deepForceUpdate(component._renderedChildren[key]);
  }
}

module.exports = deepForceUpdate;