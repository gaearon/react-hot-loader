import createPrototypeProxy from './createPrototypeProxy';
import bindAutoBindMethods from './bindAutoBindMethods';
import deleteUnknownAutoBindMethods from './deleteUnknownAutoBindMethods';

export default function proxyClass(InitialClass) {
  // Prevent double wrapping.
  // Given a proxy class, return the existing proxy managing it.
  if (Object.prototype.hasOwnProperty.call(InitialClass, '__reactPatchProxy')) {
    return InitialClass.__reactPatchProxy;
  }

  const prototypeProxy = createPrototypeProxy();
  let CurrentClass;

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

    // Naïvely proxy static methods and properties
    ProxyClass.prototype.constructor.__proto__ = NextClass;

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