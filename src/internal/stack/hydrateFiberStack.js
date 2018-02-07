/* eslint-disable no-underscore-dangle */

function pushStack(stack, node) {
  stack.type = node.type
  stack.children = []
  stack.instance = typeof node.type === 'function' ? node.stateNode : stack
}

function hydrateFiberStack(node, stack) {
  pushStack(stack, node)
  if (node.child) {
    let { child } = node
    do {
      const childStack = {}
      hydrateFiberStack(child, childStack)
      stack.children.push(childStack)
      child = child.sibling
    } while (child)
  }
}

export default hydrateFiberStack
