'use strict';

/**
 * Updates a React component recursively, so even if children define funky
 * `shouldComponentUpdate`, they are forced to re-render.
 * Makes sure that any newly added methods are properly auto-bound.
 */
function deepForceUpdate(component) {
  // ES6 classes won't have this
  if (component._bindAutoBindMethods) {
    component._bindAutoBindMethods();
  }

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