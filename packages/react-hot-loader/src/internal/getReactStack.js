/* eslint-disable no-underscore-dangle */

import hydrateFiberStack from './stack/hydrateFiberStack'
import hydrateLegacyStack from './stack/hydrateLegacyStack'
import { getInternalInstance } from './reactUtils'

function getReactStack(instance) {
  const rootNode = getInternalInstance(instance)
  const stack = {}
  const isFiber = typeof rootNode.tag === 'number'
  if (isFiber) {
    hydrateFiberStack(rootNode, stack)
  } else {
    hydrateLegacyStack(rootNode, stack)
  }
  return stack
}

export default getReactStack
