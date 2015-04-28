import difference from 'lodash/array/difference';

export default function makeAssimilatePrototype() {
  const proxy = {};
  let current = null;

  function createProxyMethod(key) {
    return function () {
      if (typeof current[key] === 'function') {
        return current[key].apply(this, arguments);
      }
    };
  }

  return function assimilatePrototype(fresh) {
    // Save current prototype
    current = fresh;

    const freshKeys = Object.getOwnPropertyNames(fresh);
    const currentKeys = Object.getOwnPropertyNames(proxy);
    const addedKeys = difference(freshKeys, currentKeys);
    const removedKeys = difference(currentKeys, freshKeys);

    // Update proxy method list
    addedKeys.forEach(key => {
      proxy[key] = createProxyMethod(key);
    });
    removedKeys.forEach(key => {
      delete proxy[key];
    })

    // Put fresh prototype into the proxy's chain so instanceof works
    proxy.__proto__ = fresh;

    // The caller will use the proxy from now on
    return proxy;
  };
};