import difference from 'lodash/array/difference';

const SPECIAL_KEYS = ['constructor'];

export default function proxyObject() {
  let proxy = {};
  let current = null;

  function proxyMethod(key) {
    return function () {
      if (typeof current[key] === 'function') {
        return current[key].apply(this, arguments);
      }
    };
  }

  function update(next) {
    // Save current source of truth
    current = next;

    const nextKeys = Object.getOwnPropertyNames(next);
    const currentKeys = Object.getOwnPropertyNames(proxy);
    const addedKeys = difference(nextKeys, currentKeys, SPECIAL_KEYS);
    const removedKeys = difference(currentKeys, nextKeys, SPECIAL_KEYS);

    // Update proxy method list
    addedKeys.forEach(key => {
      proxy[key] = proxyMethod(key);
    });
    removedKeys.forEach(key => {
      delete proxy[key];
    });
  }

  function get() {
    return proxy;
  }

  return {
    update,
    get
  };
};