import {
  getProxyByType,
  isRegisteredComponent,
  updateProxyById,
} from './proxies'
import { hotComparisonOpen } from '../global/generation'
import {
  isForwardType,
  isMemoType,
  isReloadableComponent,
} from '../internal/reactUtils'
import { areSwappable } from './utils'
import { PROXY_KEY, UNWRAP_PROXY } from '../proxy'
import { resolveType } from './resolver'

const compareComponents = (oldType, newType, setNewType) => {
  let defaultResult = oldType === newType

  if ((oldType && !newType) || (!oldType && newType)) {
    return false
  }

  if (isRegisteredComponent(oldType) || isRegisteredComponent(newType)) {
    if (resolveType(oldType) !== resolveType(newType)) {
      return false
    }
    defaultResult = true
  }

  if (isForwardType({ type: oldType }) && isForwardType({ type: newType })) {
    if (
      oldType.render === newType.render ||
      areSwappable(oldType.render, newType.render)
    ) {
      setNewType(newType)
      return true
    }
    return defaultResult
  }

  if (isMemoType({ type: oldType }) && isMemoType({ type: newType })) {
    if (
      oldType.type === newType.type ||
      areSwappable(oldType.type, newType.type)
    ) {
      setNewType(newType.type)
      return true
    }
    return defaultResult
  }

  if (
    newType !== oldType &&
    areSwappable(newType, oldType) &&
    !!oldType[PROXY_KEY] == !!newType[PROXY_KEY]
  ) {
    const unwrapFactory = newType[UNWRAP_PROXY]
    const oldProxy = unwrapFactory && getProxyByType(unwrapFactory())
    if (oldProxy) {
      oldProxy.dereference()
      updateProxyById(oldType[PROXY_KEY], newType[UNWRAP_PROXY]())
      updateProxyById(newType[PROXY_KEY], oldType[UNWRAP_PROXY]())
    } else {
      setNewType(newType)
    }
    return true
  }

  return defaultResult
}

const knownPairs = new WeakMap()
const emptyMap = new WeakMap()

export const hotComponentCompare = (oldType, newType, setNewType) => {
  const hotActive = hotComparisonOpen()
  let result = oldType === newType

  if (!isReloadableComponent(oldType) || !isReloadableComponent(newType)) {
    return result
  }

  // comparison should be active only if hot update window
  // or it would merge components it shall not
  if (hotActive) {
    result = compareComponents(oldType, newType, setNewType)
    const pair = knownPairs.get(oldType) || new WeakMap()
    pair.set(newType, result)
    knownPairs.set(oldType, pair)
    return result
  }

  if (result) {
    return result
  }

  const pair = knownPairs.get(oldType) || emptyMap
  return pair.get(newType) || false
}
