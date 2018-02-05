import reactHotLoader from '../reactHotLoader'
import { get as getGeneration } from '../global/generation'
import { getProxyByType, setStandInOptions } from './proxies'
import reconcileHotReplacement from './index'

export const RENDERED_GENERATION = 'REACT_HOT_LOADER_RENDERED_GENERATION'

export const renderReconciler = (target, force) => {
  // we are not inside parent reconcilation
  const currentGeneration = getGeneration()
  if (!reactHotLoader.disableProxyCreation) {
    if (
      (target[RENDERED_GENERATION] || force) &&
      target[RENDERED_GENERATION] !== currentGeneration
    ) {
      reconcileHotReplacement(target)
    }
  }
  target[RENDERED_GENERATION] = currentGeneration
}

export const proxyWrapper = element => {
  // post wrap on post render
  if (!element) {
    return element
  }
  if (Array.isArray(element)) {
    return element.map(proxyWrapper)
  }
  if (typeof element.type === 'function') {
    const proxy = getProxyByType(element.type)
    if (proxy) {
      return {
        ...element,
        type: proxy.get(),
      }
    }
  }
  return element
}

setStandInOptions({
  preRender: renderReconciler,
  postRender: proxyWrapper,
})
