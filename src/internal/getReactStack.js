/* eslint-disable no-underscore-dangle */

import hydrateFiberStack from './stack/hydrateFiberStack'
import hydrateLegacyStack from './stack/hydrateLegacyStack'
import { getInternalInstance } from './reactUtils'

function getReactStack(instance) {
  const rootNode = getInternalInstance(instance)
  const stack = {}
  if (rootNode) {
    // React stack
    const isFiber = typeof rootNode.tag === 'number'
    if (isFiber) {
      hydrateFiberStack(rootNode, stack)
    } else {
      hydrateLegacyStack(rootNode, stack)
    }
  } else {
    // Non-React stack
    // preact? // inferno?
    // there is no known VDOM to get stack from
  }

  return stack
}

const markUpdate = ({ fiber }) => {
  if (!fiber) {
    return
  }
  fiber.expirationTime = 1
  if (fiber.alternate) {
    fiber.alternate.expirationTime = 1
    fiber.alternate.type = fiber.type
  }
  fiber.memoizedProps = Object.assign(
    { cacheBusterProp: true },
    fiber.memoizedProps,
  )
}

export const deepMapUpdate = stack => {
  markUpdate(stack)
  if (stack.children) {
    stack.children.forEach(deepMapUpdate)
  }
}

export default getReactStack
