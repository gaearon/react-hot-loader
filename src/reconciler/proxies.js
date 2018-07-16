import createProxy, { PROXY_KEY } from '../proxy'
import { resetClassProxies } from '../proxy/createClassProxy'

let proxiesByID
let blackListedProxies
let idsByType

let elementCount = 0
let renderOptions = {}

const generateTypeId = () => `auto-${elementCount++}`

export const getIdByType = type => idsByType.get(type)
export const isProxyType = type => type[PROXY_KEY]

export const getProxyById = id => proxiesByID[id]
export const getProxyByType = type => getProxyById(getIdByType(type))

export const setStandInOptions = options => {
  renderOptions = options
}

export const updateProxyById = (id, type) => {
  // Remember the ID.
  idsByType.set(type, id)

  if (!proxiesByID[id]) {
    proxiesByID[id] = createProxy(type, id, renderOptions)
  } else {
    proxiesByID[id].update(type)
  }
  return proxiesByID[id]
}

export const createProxyForType = type =>
  getProxyByType(type) || updateProxyById(generateTypeId(), type)

export const isTypeBlacklisted = type => blackListedProxies.has(type)
export const blacklistByType = type => blackListedProxies.set(type, true)

export const resetProxies = () => {
  proxiesByID = {}
  idsByType = new WeakMap()
  blackListedProxies = new WeakMap()
  resetClassProxies()
}

resetProxies()
