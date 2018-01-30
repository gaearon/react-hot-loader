import createProxy, { isReactComponentInstance } from 'react-stand-in'
import './standInAdapter'

let proxiesByID
let idsByType

let elementCount = 0

const generateTypeId = () => `auto-${elementCount++}`

export const getIdByType = type => idsByType.get(type)

export const getProxyByType = type => proxiesByID[getIdByType(type)]

function autoWrapper(element) {
  // post wrap on post render
  if (!element) {
    return element
  }

  if (isReactComponentInstance(element)) {
    console.error(
      'React-hot-loader:',
      this,
      ' returned an render',
      element,
      'as result.',
      'You have to disable compat mode to let React-hot-loader handle this.',
      'setConfig({statelessIndeterminateComponent: true}))',
    )
    throw new Error(
      'React-hot-loader: an instance were returned from a render function. Configuration change required',
    )
  }

  if (Array.isArray(element)) {
    return element.map(autoWrapper)
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

export const updateProxyById = (id, type) => {
  // Remember the ID.
  idsByType.set(type, id)

  if (!proxiesByID[id]) {
    proxiesByID[id] = createProxy(type, id, autoWrapper)
  } else {
    proxiesByID[id].update(type)
  }
  return proxiesByID[id]
}

export const createProxyForType = type =>
  getProxyByType(type) || updateProxyById(generateTypeId(), type)

export const resetProxies = () => {
  proxiesByID = {}
  idsByType = new WeakMap()
}
