/* eslint-disable no-underscore-dangle */
import ReactDOM from 'react-dom'

const initializeHooksForFiber = ReactDOM.initializeHooksForFiber || (() => null)

function pushStack(stack, node) {
  stack.type = node.type
  stack.elementType = node.elementType || node.type
  stack.children = []
  stack.instance = typeof node.type === 'function' ? node.stateNode : stack
  stack.fiber = node

  if (!stack.instance) {
    stack.instance = {
      SFC_fake: stack.type,
      props: {},
      render: () => {
        initializeHooksForFiber(node)
        return stack.type(stack.instance.props)
      },
    }
  }
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
