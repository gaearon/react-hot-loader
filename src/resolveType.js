const createProxy = require('react-proxy').default;

let proxiesByID = {};
let idsByType = new WeakMap();

window.__REACT_HOT_LOADER__ = {
  set(id, component) {
    idsByType.set(component, id);
  }
};

function resolveType(type) {
  // We only care about composite components
  if (!type || typeof type === 'string') {
    return type;
  }

  var id = idsByType.get(type);
  if (!id) {
    return type;
  }

  // We use React Proxy to generate classes that behave almost
  // the same way as the original classes but are updatable with
  // new versions without destroying original instances.
  if (!proxiesByID[id]) {
    proxiesByID[id] = createProxy(type);
  } else if (!type.hasOwnProperty('__hasBeenUsedForProxy')) {
    proxiesByID[id].update(type);
  }

  // Give proxy class to React instead of the real class.
  return proxiesByID[id].get();
}

module.exports = resolveType;
