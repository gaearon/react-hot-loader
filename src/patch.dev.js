'use strict';

const React = require('react');
const createProxy = require('react-proxy').default;
const global = require('global');

class ComponentMap {
  constructor(useWeakMap) {
    if (useWeakMap) {
      this.wm = new WeakMap();
    } else {
      this.slots = {};
    }
  }

  getSlot(type) {
    const key = type.displayName || type.name || 'Unknown';
    if (!this.slots[key]) {
      this.slots[key] = [];
    }
    return this.slots[key];
  }

  get(type) {
    if (this.wm) {
      return this.wm.get(type);
    }

    const slot = this.getSlot(type);
    for (let i = 0; i < slot.length; i++) {
      if (slot[i].key === type) {
        return slot[i].value;
      }
    }

    return undefined;
  }

  set(type, value) {
    if (this.wm) {
      this.wm.set(type, value);
    } else {
      const slot = this.getSlot(type);
      for (let i = 0; i < slot.length; i++) {
        if (slot[i].key === type) {
          slot[i].value = value;
          return;
        }
      }
      slot.push({ key: type, value });
    }
  }

  has(type) {
    if (this.wm) {
      return this.wm.has(type);
    }

    const slot = this.getSlot(type);
    for (let i = 0; i < slot.length; i++) {
      if (slot[i].key === type) {
        return true;
      }
    }
    return false;
  }
}

let proxiesByID;
let didWarnAboutID;
let hasCreatedElementsByType;
let idsByType;

const hooks = {
  register(type, uniqueLocalName, fileName) {
    if (typeof type !== 'function') {
      return;
    }
    if (!uniqueLocalName || !fileName) {
      return;
    }
    if (typeof uniqueLocalName !== 'string' || typeof fileName !== 'string') {
      return;
    }
    const id = fileName + '#' + uniqueLocalName;
    if (!idsByType.has(type) && hasCreatedElementsByType.has(type)) {
      if (!didWarnAboutID[id]) {
        didWarnAboutID[id] = true;
        const baseName = fileName.replace(/^.*[\\\/]/, '');
        console.error( // eslint-disable-line no-console
          `React Hot Loader: ${uniqueLocalName} in ${fileName} will not hot reload ` +
          `correctly because ${baseName} uses <${uniqueLocalName} /> during ` +
          `module definition. For hot reloading to work, move ${uniqueLocalName} ` +
          `into a separate file and import it from ${baseName}.`
        );
      }
      return;
    }

    // Remember the ID.
    idsByType.set(type, id);

    // We use React Proxy to generate classes that behave almost
    // the same way as the original classes but are updatable with
    // new versions without destroying original instances.
    if (!proxiesByID[id]) {
      proxiesByID[id] = createProxy(type);
    } else {
      proxiesByID[id].update(type);
    }
  },

  reset(useWeakMap) {
    proxiesByID = {};
    didWarnAboutID = {};
    hasCreatedElementsByType = new ComponentMap(useWeakMap);
    idsByType = new ComponentMap(useWeakMap);
  },
};

hooks.reset(typeof WeakMap === 'function');

function resolveType(type) {
  // We only care about composite components
  if (typeof type !== 'function') {
    return type;
  }

  hasCreatedElementsByType.set(type, true);

  // When available, give proxy class to React instead of the real class.
  const id = idsByType.get(type);
  if (!id) {
    return type;
  }

  const proxy = proxiesByID[id];
  if (!proxy) {
    return type;
  }

  return proxy.get();
}

const createElement = React.createElement;
function patchedCreateElement(type, ...args) {
  // Trick React into rendering a proxy so that
  // its state is preserved when the class changes.
  // This will update the proxy if it's for a known type.
  const resolvedType = resolveType(type);
  return createElement(resolvedType, ...args);
}
patchedCreateElement.isPatchedByReactHotLoader = true;

if (typeof global.__REACT_HOT_LOADER__ === 'undefined') {
  React.createElement = patchedCreateElement;
  global.__REACT_HOT_LOADER__ = hooks;
}
