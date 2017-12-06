/* eslint-disable no-underscore-dangle */
// Constant to identify a React Component. It's been extracted from ReactTypeOfWork
// (https://github.com/facebook/react/blob/master/src/shared/ReactTypeOfWork.js#L20)
import getReactInstance from './getReactInstance'

function pushState(stack, instance) {
  stack.type = instance.type
  stack.tag = instance.tag
  stack.children = []
  stack.ins = typeof instance.type === 'function' ? instance.stateNode : stack
}

function traverseRenderedChildren(internalInstance, stack) {
  pushState(stack, internalInstance)

  if (internalInstance._renderedComponent) {
    const childStack = {}
    traverseRenderedChildren(internalInstance._renderedComponent, childStack)
    stack.children.push(childStack)
  } else {
    internalInstance._renderedChildren.forEach(child => {
      const childStack = {}
      traverseRenderedChildren(child, childStack)
      stack.children.push(childStack)
    })
  }
}

function hydrateStack(instance) {
  const internalInstance = instance._reactInternalInstance
  const stack = {}
  traverseRenderedChildren(internalInstance, stack)
  return stack
}

function hydrateTree(root) {
  const stack = {}
  traverseTree(root, stack)
  return stack
}

function traverseTree(root, stack) {
  pushState(stack, root)
  let node = root
  if (node.child) {
    let child = node.child
    do {
      const childStack = {}
      traverseTree(child, childStack)
      stack.children.push(childStack)
      child = child.sibling
    } while (child)
  }
}

export default function hydrate(instance) {
  const root = getReactInstance(instance)
  if (typeof root.tag !== 'number') {
    // Traverse stack-based React tree.
    return hydrateStack(instance)
  }
  return hydrateTree(root)
}
