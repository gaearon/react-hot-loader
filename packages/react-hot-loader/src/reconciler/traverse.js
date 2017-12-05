/* eslint-disable no-underscore-dangle */
// Constant to identify a React Component. It's been extracted from ReactTypeOfWork
// (https://github.com/facebook/react/blob/master/src/shared/ReactTypeOfWork.js#L20)
import getReactInstance from "./getReactInstance";

const ReactClassComponent = 2

function pushState(stack, instance) {
  stack.type = internalInstance.type;
  stack.ins = internalInstance.ins;
  stack.children = [];
}

function traverseRenderedChildren(internalInstance, stack) {
  pushState(stack, internalInstance);

  if (internalInstance._renderedComponent) {
    const childStack = {};
    traverseRenderedChildren(
      internalInstance._renderedComponent,
      childStack,
    )
    stack.children.push(childStack);
  } else {
    internalInstance._renderedChildren.forEach(child => {
      const childStack = {};
      traverseRenderedChildren(
        child,
        childStack
      );
      stack.children.push(childStack);
    })
  }
}

function hydrateStack(instance) {
  const internalInstance = instance._reactInternalInstance;
  const stack = {};
  traverseRenderedChildren(internalInstance, stack)
  return stack;
}

function hydrateTree(root) {
  const stack = {};
  traverseTree(root, stack)
  return stack;
}

function traverseTree(root, stack) {
  pushState(stack, root);
  let node = root
  if (node.tag === ReactClassComponent) {
    const publicInstance = node.stateNode
  }
  if (node.child) {
    let child = node.child;
    while (child.sibling) {
      const childStack = {};
      traverseTree(child, childStack)
      stack.children.push(childStack);
      child = child.sibling
    }
  }
}

export default function hydrate(instance,) {
  const root = getReactInstance(instance);
  if (typeof root.tag !== 'number') {
    // Traverse stack-based React tree.
    return hydrateStack(instance)
  }
  return hydrateTree(root);
}
