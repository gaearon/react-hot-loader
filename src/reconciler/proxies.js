import createProxy, { PROXY_KEY } from '../proxy'
import { resetClassProxies } from '../proxy/createClassProxy'

let proxiesByID
let blackListedProxies
let registeredComponents
let idsByType

let elementCount = 0
let renderOptions = {}

const generateTypeId = () => `auto-${elementCount++}`

export const getIdByType = type => idsByType.get(type)
export const isProxyType = type => type[PROXY_KEY]

export const getProxyById = id => proxiesByID[id]
export const getProxyByType = type => getProxyById(getIdByType(type))

export const registerComponent = type => registeredComponents.set(type, 1)
export const isRegisteredComponent = type => registeredComponents.has(type)

export const setStandInOptions = options => {
  renderOptions = options
}

export const updateFunctionProxyById = (id, type, updater) => {
  // Remember the ID.
  idsByType.set(type, id)
  const proxy = proxiesByID[id]
  if (!proxy) {
    idsByType.set(type, id)
    proxiesByID[id] = type
  }
  updater(proxiesByID[id], type)

  return proxiesByID[id]
}

export const updateProxyById = (id, type, options = {}) => {
  // Remember the ID.
  idsByType.set(type, id)

  if (!proxiesByID[id]) {
    proxiesByID[id] = createProxy(type, id, { ...renderOptions, ...options })
  } else {
    proxiesByID[id].update(type)
  }
  return proxiesByID[id]
}

export const createProxyForType = (type, options) =>
  getProxyByType(type) || updateProxyById(generateTypeId(), type, options)

export const isTypeBlacklisted = type => blackListedProxies.has(type)
export const blacklistByType = type => blackListedProxies.set(type, true)

export const resetProxies = () => {
  proxiesByID = {}
  idsByType = new WeakMap()
  blackListedProxies = new WeakMap()
  registeredComponents = new WeakMap()
  resetClassProxies()
}

resetProxies()
