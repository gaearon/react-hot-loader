const React = require('react');
const createProxy = require('react-proxy').default;

let proxies = {};
function resolveType(type) {
  if (!type) {
    return type;
  }
  const source = type.__source;
  if (!source || !source.fileName || !source.exportName) {
    return type;
  }

  const fairlyUniqueID = source.fileName + '#' + source.exportName;
  if (!proxies[fairlyUniqueID]) {
    proxies[fairlyUniqueID] = createProxy(type);
  } else {
    proxies[fairlyUniqueID].update(type);
  }
  return proxies[fairlyUniqueID].get();
}

if (React.createElement.isPatchedByReactHotLoader) {
  throw new Error('Cannot patch React twice.');
}

const createElement = React.createElement;
function patchedCreateElement(type, ...args) {
  return createElement(resolveType(type), ...args);
}
patchedCreateElement.isPatchedByReactHotLoader = true;
React.createElement = patchedCreateElement;
