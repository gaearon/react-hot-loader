import createPrototypeProxy from './createPrototypeProxy';
import bindAutoBindMethods from './bindAutoBindMethods';
import deleteUnknownAutoBindMethods from './deleteUnknownAutoBindMethods';

const RESERVED_STATICS = [
  'length',
  'name',
  'arguments',
  'caller',
  'prototype',
  'toString'
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

export default function proxyClass(InitialComponent) {
  // Prevent double wrapping.
  // Given a proxy class, return the existing proxy managing it.
  if (Object.prototype.hasOwnProperty.call(InitialComponent, '__reactPatchProxy')) {
    return InitialComponent.__reactPatchProxy;
  }

  let CurrentComponent;
  let ProxyComponent;

  let staticDescriptors = {};
  function wasStaticModifiedByUser(key) {
    // Compare the descriptor with the one we previously set ourselves.
    const currentDescriptor = Object.getOwnPropertyDescriptor(ProxyComponent, key);
    return !isEqualDescriptor(staticDescriptors[key], currentDescriptor);
  }

  try {
    // Create a proxy constructor with matching name
    ProxyComponent = new Function('getCurrentComponent',
      `return function ${InitialComponent.name || 'ProxyComponent'}() {
         return getCurrentComponent().apply(this, arguments);
      }`
    )(() => CurrentComponent);
  } catch (err) {
    // Some environments may forbid dynamic evaluation
    ProxyComponent = function () {
      return CurrentComponent.apply(this, arguments);
    };
  }

  // Proxy toString() to the current constructor
  ProxyComponent.toString = function toString() {
    return CurrentComponent.toString();
  };

  let prototypeProxy;
  if (InitialComponent.prototype && InitialComponent.prototype.isReactComponent) {
    // Point proxy constructor to the proxy prototype
    prototypeProxy = createPrototypeProxy();
    ProxyComponent.prototype = prototypeProxy.get();
  }

  function update(NextComponent) {
    if (typeof NextComponent !== 'function') {
      throw new Error('Expected a constructor.');
    }

    // Prevent proxy cycles
    if (Object.prototype.hasOwnProperty.call(NextComponent, '__reactPatchProxy')) {
      return update(NextComponent.__reactPatchProxy.__getCurrent());
    }

    // Save the next constructor so we call it
    CurrentComponent = NextComponent;

    // Try to infer displayName
    ProxyComponent.displayName = NextComponent.displayName || NextComponent.name;

    // Set up the same prototype for inherited statics
    ProxyComponent.__proto__ = NextComponent.__proto__;

    // Copy static methods and properties
    Object.getOwnPropertyNames(NextComponent).forEach(key => {
      if (RESERVED_STATICS.indexOf(key) > -1) {
        return;
      }

      const staticDescriptor = {
        ...Object.getOwnPropertyDescriptor(NextComponent, key),
        configurable: true
      };

      // Copy static unless user has redefined it at runtime
      if (!wasStaticModifiedByUser(key)) {
        Object.defineProperty(ProxyComponent, key, staticDescriptor);
        staticDescriptors[key] = staticDescriptor;
      }
    });

    // Remove old static methods and properties
    Object.getOwnPropertyNames(ProxyComponent).forEach(key => {
      if (RESERVED_STATICS.indexOf(key) > -1) {
        return;
      }

      // Skip statics that exist on the next class
      if (NextComponent.hasOwnProperty(key)) {
        return;
      }

      // Skip non-configurable statics
      const descriptor = Object.getOwnPropertyDescriptor(ProxyComponent, key);
      if (descriptor && !descriptor.configurable) {
        return;
      }

      // Delete static unless user has redefined it at runtime
      if (!wasStaticModifiedByUser(key)) {
        delete ProxyComponent[key];
        delete staticDescriptors[key];
      }
    });

    if (prototypeProxy) {
      // Update the prototype proxy with new methods
      const mountedInstances = prototypeProxy.update(NextComponent.prototype);

      // Set up the constructor property so accessing the statics work
      ProxyComponent.prototype.constructor = ProxyComponent;

      // We might have added new methods that need to be auto-bound
      mountedInstances.forEach(bindAutoBindMethods);
      mountedInstances.forEach(deleteUnknownAutoBindMethods);
    }
  };

  function get() {
    return ProxyComponent;
  }

  function getCurrent() {
    return CurrentComponent;
  }

  update(InitialComponent);

  const proxy = { get, update };

  Object.defineProperty(proxy, '__getCurrent', {
    configurable: false,
    writable: false,
    enumerable: false,
    value: getCurrent
  });

  Object.defineProperty(ProxyComponent, '__reactPatchProxy', {
    configurable: false,
    writable: false,
    enumerable: false,
    value: proxy
  });

  return proxy;
}