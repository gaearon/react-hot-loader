import difference from 'lodash/array/difference';

const SPECIAL_KEYS = ['constructor'];

export default function makeProxy(proxy) {
  let current = null;

  function createProxyMethod(key) {
    return function () {
      if (typeof current[key] === 'function') {
        return current[key].apply(this, arguments);
      }
    };
  }

  return function proxyTo(fresh) {
    // Save current source of truth
    current = fresh;

    const freshKeys = Object.getOwnPropertyNames(fresh);
    const currentKeys = Object.getOwnPropertyNames(proxy);
    const addedKeys = difference(freshKeys, currentKeys, SPECIAL_KEYS);
    const removedKeys = difference(currentKeys, freshKeys, SPECIAL_KEYS);

    // Update proxy method list
    addedKeys.forEach(key => {
      proxy[key] = createProxyMethod(key);
    });
    removedKeys.forEach(key => {
      delete proxy[key];
    })

    // The caller will use the proxy from now on
    return proxy;
  };
};