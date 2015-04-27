'use strict';

function traverseRenderedChildren(internalInstance, callback, argument) {
  callback(internalInstance, argument);

  if (internalInstance._renderedComponent) {
    traverseRenderedChildren(
      internalInstance._renderedComponent,
      callback,
      argument
    );
  } else {
    for (var key in internalInstance._renderedChildren) {
      traverseRenderedChildren(
        internalInstance._renderedChildren[key],
        callback,
        argument
      );
    }
  }
}

module.exports = traverseRenderedChildren;
