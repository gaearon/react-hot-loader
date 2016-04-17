var React = require('react');

var createProxy = require('react-proxy').default;
var proxies = {};
function resolveType(type) {
  if (!type) {
    return type;
  }
  var source = type.__source;
  if (!source || !source.fileName || !source.exportName) {
    return type;
  }

  var fairlyUniqueID = source.fileName + '#' + source.exportName;
  if (!proxies[fairlyUniqueID]) {
    proxies[fairlyUniqueID] = createProxy(type);
  } else {
    proxies[fairlyUniqueID].update(type);
  }
  return proxies[fairlyUniqueID].get();
}

function patchReact() {
  if (React.createElement.isPatchedByReactHotLoader) {
    throw new Error('Cannot patch React twice.');
  }

  var createElement = React.createElement;
  function patchedCreateElement(type) {
    return createElement.apply(this, [
      resolveType(type)
    ].concat(
      Array.prototype.slice.call(arguments, 1)
    ));
  }
  patchedCreateElement.isPatchedByReactHotLoader = true;
  React.createElement = patchedCreateElement;
}

patchReact();
