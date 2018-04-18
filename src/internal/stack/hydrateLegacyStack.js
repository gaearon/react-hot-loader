/* eslint-disable no-underscore-dangle */

function pushState(stack, type, instance) {
  stack.type = type
  stack.children = []
  stack.instance = instance || stack

  if (typeof type === 'function' && type.isStatelessFunctionalProxy) {
    // In React 15 SFC is wrapped by component. We have to detect our proxies and change the way it works
    stack.instance = {
      SFC_fake: type,
      props: {},
      render: () => type(stack.instance.props),
    }
  }
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
