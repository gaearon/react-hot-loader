import find from 'lodash/find';
import createPrototypeProxy from './createPrototypeProxy';
import bindAutoBindMethods from './bindAutoBindMethods';
import deleteUnknownAutoBindMethods from './deleteUnknownAutoBindMethods';
import supportsProtoAssignment from './supportsProtoAssignment';

const RESERVED_STATICS = [
  'length',
  'displayName',
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

function getDisplayName(Component) {
  const displayName = Component.displayName || Component.name;
  return (displayName && displayName !== 'ReactComponent') ?
    displayName :
    'Unknown';
}

// This was originally a WeakMap but we had issues with React Native:
// https://github.com/gaearon/react-proxy/issues/50#issuecomment-192928066
let allProxies = [];
function findProxy(Component) {
  const pair = find(allProxies, ([key]) => key === Component);
  return pair ? pair[1] : null;
}
function addProxy(Component, proxy) {
  allProxies.push([Component, proxy]);
}

function proxyClass(InitialComponent) {
  // Prevent double wrapping.
  // Given a proxy class, return the existing proxy managing it.
  var existingProxy = findProxy(InitialComponent);
  if (existingProxy) {
    return existingProxy;
  }

  let CurrentComponent;
  let ProxyComponent;
  let savedDescriptors = {};

  function instantiate(factory, context, params) {
    const component = factory();

    try {
      return component.apply(context, params);
    } catch (err) {
      // Native ES6 class instantiation
      const instance = new component(...params);

      Object.keys(instance).forEach(key => {
        if (RESERVED_STATICS.indexOf(key) > -1) {
          return;
        }
        context[key] = instance[key];
      })
    }
  }

  let displayName = getDisplayName(InitialComponent);
  try {
    // Create a proxy constructor with matching name
    ProxyComponent = new Function('factory', 'instantiate',
      `return function ${displayName}() {
         return instantiate(factory, this, arguments);
      }`
    )(() => CurrentComponent, instantiate);
  } catch (err) {
    // Some environments may forbid dynamic evaluation
    ProxyComponent = function () {
      return instantiate(() => CurrentComponent, this, arguments);
    };
  }
  try {
    Object.defineProperty(ProxyComponent, 'name', {
      value: displayName
    });
  } catch (err) { }

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
    if (NextComponent === CurrentComponent) {
      return;
    }

    // Prevent proxy cycles
    var existingProxy = findProxy(NextComponent);
    if (existingProxy) {
      return update(existingProxy.__getCurrent());
    }

    // Save the next constructor so we call it
    const PreviousComponent = CurrentComponent;
    CurrentComponent = NextComponent;

    // Try to infer displayName
    displayName = getDisplayName(NextComponent);
    ProxyComponent.displayName = displayName;
    try {
      Object.defineProperty(ProxyComponent, 'name', {
        value: displayName
      });
    } catch (err) { }

    // Set up the same prototype for inherited statics
    ProxyComponent.__proto__ = NextComponent.__proto__;

    // Copy over static methods and properties added at runtime
    if (PreviousComponent) {
      Object.getOwnPropertyNames(PreviousComponent).forEach(key => {
        if (RESERVED_STATICS.indexOf(key) > -1) {
          return;
        }

        const prevDescriptor = Object.getOwnPropertyDescriptor(PreviousComponent, key);
        const savedDescriptor = savedDescriptors[key];

        if (!isEqualDescriptor(prevDescriptor, savedDescriptor)) {
          Object.defineProperty(NextComponent, key, prevDescriptor);
        }
      });
    }

    // Copy newly defined static methods and properties
    Object.getOwnPropertyNames(NextComponent).forEach(key => {
      if (RESERVED_STATICS.indexOf(key) > -1) {
        return;
      }

      const prevDescriptor = PreviousComponent && Object.getOwnPropertyDescriptor(PreviousComponent, key);
      const savedDescriptor = savedDescriptors[key];

      // Skip redefined descriptors
      if (prevDescriptor && savedDescriptor && !isEqualDescriptor(savedDescriptor, prevDescriptor)) {
        Object.defineProperty(NextComponent, key, prevDescriptor);
        Object.defineProperty(ProxyComponent, key, prevDescriptor);
        return;
      }

      if (prevDescriptor && !savedDescriptor) {
        Object.defineProperty(ProxyComponent, key, prevDescriptor);
        return;
      }

      const nextDescriptor = {
        ...Object.getOwnPropertyDescriptor(NextComponent, key),
        configurable: true
      };
      savedDescriptors[key] = nextDescriptor;
      Object.defineProperty(ProxyComponent, key, nextDescriptor);
    });

    // Remove static methods and properties that are no longer defined
    Object.getOwnPropertyNames(ProxyComponent).forEach(key => {
      if (RESERVED_STATICS.indexOf(key) > -1) {
        return;
      }
      // Skip statics that exist on the next class
      if (NextComponent.hasOwnProperty(key)) {
        return;
      }
      // Skip non-configurable statics
      const proxyDescriptor = Object.getOwnPropertyDescriptor(ProxyComponent, key);
      if (proxyDescriptor && !proxyDescriptor.configurable) {
        return;
      }

      const prevDescriptor = PreviousComponent && Object.getOwnPropertyDescriptor(PreviousComponent, key);
      const savedDescriptor = savedDescriptors[key];

      // Skip redefined descriptors
      if (prevDescriptor && savedDescriptor && !isEqualDescriptor(savedDescriptor, prevDescriptor)) {
        return;
      }

      delete ProxyComponent[key];
    });

    if (prototypeProxy) {
      // Update the prototype proxy with new methods
      const mountedInstances = prototypeProxy.update(NextComponent.prototype);

      // Set up the constructor property so accessing the statics work
      ProxyComponent.prototype.constructor = NextComponent;

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
  addProxy(ProxyComponent, proxy);

  Object.defineProperty(proxy, '__getCurrent', {
    configurable: false,
    writable: false,
    enumerable: false,
    value: getCurrent
  });

  return proxy;
}

function createFallback(Component) {
  let CurrentComponent = Component;

  return {
    get() {
      return CurrentComponent;
    },
    update(NextComponent) {
      CurrentComponent = NextComponent;
    }
  };
}

export default function createClassProxy(Component) {
  return Component.__proto__ && supportsProtoAssignment() ?
    proxyClass(Component) :
    createFallback(Component);
}
