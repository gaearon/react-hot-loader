/* eslint-disable no-underscore-dangle */

import { getReactInstance, getReactComponent } from './reactUtils'

function pushState(stack, instance, element) {
  stack.type = instance.type
  stack.tag = instance.tag
  stack.children = []
  stack.instance = element || getReactComponent(instance) || stack
}

// these function might be obsolete
function traverseRenderedChildren(internalInstance, stack) {
  if (internalInstance._currentElement) {
    pushState(
      stack,
      internalInstance._currentElement,
      internalInstance._instance,
    )
  }

  if (internalInstance._renderedComponent) {
    const childStack = {}
    traverseRenderedChildren(internalInstance._renderedComponent, childStack)
    stack.children.push(childStack)
  } else if (internalInstance._renderedChildren) {
    Object.keys(internalInstance._renderedChildren).forEach(key => {
      const childStack = {}
      traverseRenderedChildren(
        internalInstance._renderedChildren[key],
        childStack,
      )
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

function traverseTree(root, stack) {
  pushState(stack, root)
  const node = root
  if (node.child) {
    let { child } = node
    do {
      const childStack = {}
      traverseTree(child, childStack)
      stack.children.push(childStack)
      child = child.sibling
    } while (child)
  }
}

// modern react tree
function hydrateTree(root) {
  const stack = {}
  traverseTree(root, stack)
  return stack
}

export default function hydrate(instance) {
  const root = getReactInstance(instance)
  if (typeof root.tag !== 'number') {
    // Traverse stack-based React tree.
    return hydrateStack(instance)
  }
  return hydrateTree(root)
}
