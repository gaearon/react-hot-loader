/* eslint-disable no-underscore-dangle */

function pushState(stack, type, instance) {
  stack.type = type
  stack.children = []
  stack.instance = instance || stack
}

function hydrateLegacyStack(node, stack) {
  if (node._currentElement) {
    pushState(stack, node._currentElement.type, node._instance || stack)
  }

  if (node._renderedComponent) {
    const childStack = {}
    hydrateLegacyStack(node._renderedComponent, childStack)
    stack.children.push(childStack)
  } else if (node._renderedChildren) {
    Object.keys(node._renderedChildren).forEach(key => {
      const childStack = {}
      hydrateLegacyStack(node._renderedChildren[key], childStack)
      stack.children.push(childStack)
    })
  }
}

export default hydrateLegacyStack
