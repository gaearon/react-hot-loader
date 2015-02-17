'use strict';

function traverseRenderedChildren(internalInstance, callback) {
  callback(internalInstance);

  if (internalInstance._renderedComponent) {
    traverseRenderedChildren(
      internalInstance._renderedComponent,
      callback
    );
  } else {
    for (var key in internalInstance._renderedChildren) {
      traverseRenderedChildren(
        internalInstance._renderedChildren[key],
        callback
      );
    }
  }
}

module.exports = traverseRenderedChildren;
