import createProxy from 'react-stand-in'

let proxiesByID
let idsByType

let elementCount = 0

const generateTypeId = () => `auto-${elementCount++}`

export const getIdByType = type => idsByType.get(type)

export const getProxyByType = type => proxiesByID[getIdByType(type)]

export const updateProxyById = (id, type) => {
  // Remember the ID.
  idsByType.set(type, id)

  if (!proxiesByID[id]) {
    proxiesByID[id] = createProxy(type, id)
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
