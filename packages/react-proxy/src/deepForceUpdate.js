'use strict';

var bindAutoBindMethods = require('./bindAutoBindMethods');
var traverseRenderedChildren = require('./traverseRenderedChildren');

function setPendingForceUpdate(internalInstance) {
  if (internalInstance._pendingForceUpdate === false) {
    internalInstance._pendingForceUpdate = true;
  }
}

function forceUpdateIfPending(internalInstance, React) {
  if (internalInstance._pendingForceUpdate === true) {
    // `|| internalInstance` for React 0.12 and earlier
    var instance = internalInstance._instance || internalInstance;

    if (instance.forceUpdate) {
      instance.forceUpdate();
    } else if (React && React.Component) {
      React.Component.prototype.forceUpdate.call(instance);
    }
  }
}

/**
 * Updates a React component recursively, so even if children define funky
 * `shouldComponentUpdate`, they are forced to re-render.
 * Makes sure that any newly added methods are properly auto-bound.
 */
function deepForceUpdate(internalInstance, React) {
  traverseRenderedChildren(internalInstance, bindAutoBindMethods);
  traverseRenderedChildren(internalInstance, setPendingForceUpdate);
  traverseRenderedChildren(internalInstance, forceUpdateIfPending, React);
}

module.exports = deepForceUpdate;
