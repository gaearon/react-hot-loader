import difference from 'lodash/array/difference';

export default function createPrototypeProxy() {
  let proxy = {};
  let current = null;
  let mountedInstances = [];

  function proxyMethod(key) {
    return function () {
      if (typeof current[key] === 'function') {
        return current[key].apply(this, arguments);
      }
    };
  }

  function proxiedComponentWillMount() {
    mountedInstances.push(this);
    if (typeof current.componentWillMount === 'function') {
      return current.componentWillMount.apply(this, arguments);
    }
  }

  function proxiedComponentWillUnmount() {
    mountedInstances.splice(mountedInstances.indexOf(this), 1);
    if (typeof current.componentWillUnmount === 'function') {
      return current.componentWillUnmount.apply(this, arguments);
    }
  }

  function update(next) {
    // Save current source of truth
    current = next;

    const nextKeys = Object.getOwnPropertyNames(next);
    const currentKeys = Object.getOwnPropertyNames(proxy);
    const addedKeys = difference(nextKeys, currentKeys);
    const removedKeys = difference(currentKeys, nextKeys);

    removedKeys.forEach(key => {
      delete proxy[key];
    });
    addedKeys.forEach(key => {
      if (typeof next[key] === 'function') {
        proxy[key] = proxyMethod(key);
      }
    });

    // Track mounted instances so we can forceUpdate() them later
    proxy.componentWillMount = proxiedComponentWillMount;
    proxy.componentWillUnmount = proxiedComponentWillUnmount;

    // Woodoo to appease Babel and React
    proxy.__proto__ = next;
    proxy.__reactAutoBindMap = {};
  }

  function get() {
    return proxy;
  }

  function getMountedInstances() {
    return mountedInstances;
  }

  return {
    update,
    get,
    getMountedInstances
  };
};