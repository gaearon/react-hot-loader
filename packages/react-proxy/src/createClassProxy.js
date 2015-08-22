import createPrototypeProxy from './createPrototypeProxy';
import { bindAutoBindMethods, deleteUnknownAutoBindMethods } from './bindAutoBindMethods';

export default function proxyClass(InitialClass) {
  const prototypeProxy = createPrototypeProxy();
  let CurrentClass;

  function ProxyClass() {
    CurrentClass.apply(this, arguments);
  }

  // Point proxy constructor to the proxy prototype
  ProxyClass.prototype = prototypeProxy.get();

  function update(NextClass) {
    if (typeof NextClass !== 'function') {
      throw new Error('Expected a constructor.');
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
    ProxyClass.displayName = NextClass.name || NextClass.displayName;

    // We might have added new methods that need to be auto-bound
    mountedInstances.forEach(bindAutoBindMethods);
    mountedInstances.forEach(deleteUnknownAutoBindMethods);

    // Let the user take care of redrawing
    return mountedInstances;
  };

  function get() {
    return ProxyClass;
  }

  update(InitialClass);

  return {
    get,
    update
  };
}