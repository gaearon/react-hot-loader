import React from 'react';
import createPrototypeProxy from './createPrototypeProxy';
import { bindAutoBindMethods, deleteUnknownAutoBindMethods } from './bindAutoBindMethods';

/**
 * Force-updates an instance regardless of whether
 * it descends from React.Component or not.
 */
function forceUpdate(instance) {
  React.Component.prototype.forceUpdate.call(instance);
}

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
    prototypeProxy.update(NextClass.prototype);

    // Set up the constructor property so accessing the statics work
    ProxyClass.prototype.constructor = ProxyClass;

    // Naïvely proxy static methods and properties
    ProxyClass.prototype.constructor.__proto__ = NextClass;

    // Try to infer displayName
    ProxyClass.displayName = NextClass.name || NextClass.displayName;

    // Grab all mounted instances
    const mountedInstances = prototypeProxy.getMountedInstances();

    // We might have added new methods that need to be auto-bound
    mountedInstances.forEach(bindAutoBindMethods);
    mountedInstances.forEach(deleteUnknownAutoBindMethods);

    // Force redraw regardless of shouldComponentUpdate()
    mountedInstances.forEach(forceUpdate);
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