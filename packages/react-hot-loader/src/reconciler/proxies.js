import ComponentMap from "./ComponentMap";
import createProxy from 'react-stand-in'

let proxiesByID
let didWarnAboutID
let hasCreatedElementsByType
let idsByType
let knownSignatures
let proxyUpdated

export const isTypeRegistered = type => idsByType.has(type);
export const isTypeUsed = type => hasCreatedElementsByType.has(type);
export const getIdByType = type => idsByType.get(type);
export const getProxyByType = type => proxiesByID[getIdByType(type)];

export const willWarnAboutId = id => {
  const didWarn = didWarnAboutID[id];
  didWarnAboutID[id] = true;
  return didWarn;
};

export const willCreateElement = (type) => {
  const wasKnown = hasCreatedElementsByType.get(type)
  hasCreatedElementsByType.set(type, true)
  return wasKnown;
};

export const didUpdateProxy = () => proxyUpdated;

export const updateProxyById = (id, type) => {
  // Remember the ID.
  idsByType.set(type, id)

  // We use React Proxy to generate classes that behave almost
  // the same way as the original classes but are updatable with
  // new versions without destroying original instances.
  if (!proxiesByID[id]) {
    proxiesByID[id] = createProxy(type)
  } else {
    proxiesByID[id].update(type)
    proxyUpdated = true
  }
}

export const resetProxies = (useWeakMap) => {
  proxiesByID = {}
  didWarnAboutID = {}
  hasCreatedElementsByType = new ComponentMap(useWeakMap)
  idsByType = new ComponentMap(useWeakMap)
  knownSignatures = {}
  proxyUpdated = false
};