function traverseRenderedChildren(internalInstance, callback, argument) {
  callback(internalInstance, argument);

  if (internalInstance._renderedComponent) {
    traverseRenderedChildren(
      internalInstance._renderedComponent,
      callback,
      argument
    );
  } else {
    for (let key in internalInstance._renderedChildren) {
      if (internalInstance._renderedChildren.hasOwnProperty(key)) {
        traverseRenderedChildren(
          internalInstance._renderedChildren[key],
          callback,
          argument
        );
      }
    }
  }
}

function setPendingForceUpdate(internalInstance) {
  if (internalInstance._pendingForceUpdate === false) {
    internalInstance._pendingForceUpdate = true;
  }
}

function forceUpdateIfPending(internalInstance, React) {
  if (internalInstance._pendingForceUpdate === true) {
    const publicInstance = internalInstance._instance;
    React.Component.prototype.forceUpdate.call(publicInstance);
  }
}

export default function getForceUpdate(React) {
  return instance => {
    const internalInstance = instance._reactInternalInstance;
    traverseRenderedChildren(internalInstance, setPendingForceUpdate);
    traverseRenderedChildren(internalInstance, forceUpdateIfPending, React);
  };
}
