import assign from 'lodash/object/assign';
import difference from 'lodash/array/difference';

export default function createPrototypeProxy() {
  let proxy = {};
  let current = null;
  let mountedInstances = [];

  function proxyMethod(name) {
    return function () {
      if (typeof current[name] === 'function') {
        return current[name].apply(this, arguments);
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

    // Find changed property names
    const nextNames = Object.getOwnPropertyNames(next);
    const currentNames = Object.getOwnPropertyNames(proxy);
    const addedNames = difference(nextNames, currentNames);
    const removedNames = difference(currentNames, nextNames);

    // Remove properties and methods that are no longer there
    removedNames.forEach(name => {
      delete proxy[name];
    });

    // Copy every descriptor
    nextNames.forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(next, name);
      Object.defineProperty(proxy, name, descriptor);
    });

    // Proxy newly added methods
    addedNames.forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(next, name);
      if (typeof descriptor.value !== 'function') {
        return;
      }

      // Wrap the original function
      proxy[name] = proxyMethod(name);
      // Copy properties of the original function, if any
      assign(proxy[name], descriptor.value);
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