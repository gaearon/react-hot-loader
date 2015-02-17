'use strict';

var bindAutoBindMethods = require('./bindAutoBindMethods');
var traverseRenderedChildren = require('./traverseRenderedChildren');

function setPendingForceUpdate(internalInstance) {
  if (internalInstance._pendingForceUpdate === false) {
    internalInstance._pendingForceUpdate = true;
  }
}

function forceUpdateIfPending(internalInstance) {
  if (internalInstance._pendingForceUpdate === true) {
    // `|| internalInstance` for React 0.12 and earlier
    (internalInstance._instance || internalInstance).forceUpdate();
  }
}

/**
 * Updates a React component recursively, so even if children define funky
 * `shouldComponentUpdate`, they are forced to re-render.
 * Makes sure that any newly added methods are properly auto-bound.
 */
function deepForceUpdate(internalInstance) {
  traverseRenderedChildren(internalInstance, bindAutoBindMethods);
  traverseRenderedChildren(internalInstance, setPendingForceUpdate);
  traverseRenderedChildren(internalInstance, forceUpdateIfPending);
}

module.exports = deepForceUpdate;
