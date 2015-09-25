import createPrototypeProxy from './createPrototypeProxy';
import bindAutoBindMethods from './bindAutoBindMethods';
import deleteUnknownAutoBindMethods from './deleteUnknownAutoBindMethods';

const RESERVED_STATICS = [
  'length',
  'name',
  'arguments',
  'caller',
  'prototype'
];

function isEqualDescriptor(a, b) {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  for (let key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

export default function proxyClass(InitialClass) {
  // Prevent double wrapping.
  // Given a proxy class, return the existing proxy managing it.
  if (Object.prototype.hasOwnProperty.call(InitialClass, '__reactPatchProxy')) {
    return InitialClass.__reactPatchProxy;
  }

  const prototypeProxy = createPrototypeProxy();
  let CurrentClass;

  let staticDescriptors = {};
  function wasStaticModifiedByUser(key) {
    // Compare the descriptor with the one we previously set ourselves.
    const currentDescriptor = Object.getOwnPropertyDescriptor(ProxyClass, key);
    return !isEqualDescriptor(staticDescriptors[key], currentDescriptor);
  }

  let ProxyClass;
  try {
    // Create a proxy constructor with matching name
    ProxyClass = new Function('getCurrentClass',
      `return function ${InitialClass.name || 'ProxyClass'}() {
        return getCurrentClass().apply(this, arguments);
      }`
    )(() => CurrentClass);
  } catch (err) {
    // Some environments may forbid dynamic evaluation
    ProxyClass = function () {
      return CurrentClass.apply(this, arguments);
    };
  }

  // Point proxy constructor to the proxy prototype
  ProxyClass.prototype = prototypeProxy.get();

  function update(NextClass) {
    if (typeof NextClass !== 'function') {
      throw new Error('Expected a constructor.');
    }

    // Prevent proxy cycles
    if (Object.prototype.hasOwnProperty.call(NextClass, '__reactPatchProxy')) {
      return update(NextClass.__reactPatchProxy.__getCurrent());
    }

    // Save the next constructor so we call it
    CurrentClass = NextClass;

    // Update the prototype proxy with new methods
    const mountedInstances = prototypeProxy.update(NextClass.prototype);

    // Set up the constructor property so accessing the statics work
    ProxyClass.prototype.constructor = ProxyClass;

    // Set up the same prototype for inherited statics
    ProxyClass.__proto__ = NextClass.__proto__;

    // Copy static methods and properties
    Object.getOwnPropertyNames(NextClass).forEach(key => {
      if (RESERVED_STATICS.indexOf(key) > -1) {
        return;
      }

      const staticDescriptor = {
        ...Object.getOwnPropertyDescriptor(NextClass, key),
        configurable: true
      };

      // Copy static unless user has redefined it at runtime
      if (!wasStaticModifiedByUser(key)) {
        Object.defineProperty(ProxyClass, key, staticDescriptor);
        staticDescriptors[key] = staticDescriptor;
      }
    });

    // Remove old static methods and properties
    Object.getOwnPropertyNames(ProxyClass).forEach(key => {
      // Skip statics that exist on the next class
      if (NextClass.hasOwnProperty(key)) {
        return;
      }

      // Skip non-configurable statics
      const descriptor = Object.getOwnPropertyDescriptor(ProxyClass, key);
      if (descriptor && !descriptor.configurable) {
        return;
      }

      // Delete static unless user has redefined it at runtime
      if (!wasStaticModifiedByUser(key)) {
        delete ProxyClass[key];
        delete staticDescriptors[key];
      }
    });

    // Try to infer displayName
    ProxyClass.displayName = NextClass.displayName || NextClass.name;

    // We might have added new methods that need to be auto-bound
    mountedInstances.forEach(bindAutoBindMethods);
    mountedInstances.forEach(deleteUnknownAutoBindMethods);

    // Let the user take care of redrawing
    return mountedInstances;
  };

  function get() {
    return ProxyClass;
  }

  function getCurrent() {
    return CurrentClass;
  }

  update(InitialClass);

  const proxy = { get, update };

  Object.defineProperty(proxy, '__getCurrent', {
    configurable: false,
    writable: false,
    enumerable: false,
    value: getCurrent
  });

  Object.defineProperty(ProxyClass, '__reactPatchProxy', {
    configurable: false,
    writable: false,
    enumerable: false,
    value: proxy
  });

  return proxy;
}