// Constant to identify a React Component. It's been extracted from ReactTypeOfWork
// (https://github.com/facebook/react/blob/master/src/shared/ReactTypeOfWork.js#L20)
const ReactClassComponent = 2;

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

function setPendingForceUpdate(internalInstance, shouldUpdate) {
  if (
    internalInstance._pendingForceUpdate === false &&
    shouldUpdate(internalInstance)
  ) {
    internalInstance._pendingForceUpdate = true;
  }
}

function forceUpdateIfPending(internalInstance, onUpdate) {
  if (internalInstance._pendingForceUpdate === true) {
    const publicInstance = internalInstance._instance;
    const { updater } = publicInstance;

    if (typeof publicInstance.forceUpdate === 'function') {
      publicInstance.forceUpdate();
    } else if (updater && typeof updater.enqueueForceUpdate === 'function') {
      updater.enqueueForceUpdate(publicInstance);
    }
    onUpdate(internalInstance);
  }
}

function deepForceUpdateStack(instance, shouldUpdate, onUpdate) {
  const internalInstance = instance._reactInternalInstance;
  traverseRenderedChildren(internalInstance, setPendingForceUpdate, shouldUpdate);
  traverseRenderedChildren(internalInstance, forceUpdateIfPending, onUpdate);
}

export default function deepForceUpdate(
  instance,
  shouldUpdate = () => true,
  onUpdate = () => {},
) {
  const root = instance._reactInternalFiber || instance._reactInternalInstance;
  if (typeof root.tag !== 'number') {
    // Traverse stack-based React tree.
    return deepForceUpdateStack(instance, shouldUpdate, onUpdate);
  }

  let node = root;
  while (true) {
    if (node.tag === ReactClassComponent && shouldUpdate(node)) {
      const publicInstance = node.stateNode;
      const { updater } = publicInstance;
      if (typeof publicInstance.forceUpdate === 'function') {
        publicInstance.forceUpdate();
      } else if (updater && typeof updater.enqueueForceUpdate === 'function') {
        updater.enqueueForceUpdate(publicInstance);
      }
      onUpdate(node);
    }
    if (node.child) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === root) {
      return undefined;
    }
    while (!node.sibling) {
      if (!node.return || node.return === root) {
        return undefined;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}
