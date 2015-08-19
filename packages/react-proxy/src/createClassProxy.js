import React from 'react';
import createPrototypeProxy from './createPrototypeProxy';

/**
 * Force-updates an instance regardless of whether
 * it descends from React.Component or not.
 */
function forceUpdate(instance) {
  React.Component.prototype.forceUpdate.call(instance);
}

/**
 * Wraps componentWillMount and componentWillUnmount to
 * push and remove instances from `mountedInstances`.
 * This lets us `forceUpdate` instances when we need to.
 *
 * We could listen to componentDidMount, but shallow renderer
 * we're using in tests doesn't call it, and we don't really care.
 */
function trackMount(prototype, mountedInstances) {
  const realComponentWillMount = prototype.componentWillMount;
  prototype.componentWillMount = function componentWillMount() {
    mountedInstances.push(this);

    if (realComponentWillMount) {
      realComponentWillMount.apply(this, arguments);
    }
  };

  const realComponentWillUnmount = prototype.componentWillUnmount;
  prototype.componentWillUnmount = function componentWillUnmount() {
    mountedInstances.splice(mountedInstances.indexOf(this), 1);

    if (realComponentWillUnmount) {
      realComponentWillUnmount.apply(this, arguments);
    }
  };

  return prototype;
}

export default function proxyClass(InitialClass) {
  const prototypeProxy = createPrototypeProxy();
  const mountedInstances = [];
  let CurrentClass;

  function ProxyClass() {
    CurrentClass.apply(this, arguments);
  }

  function update(NextClass) {
    if (typeof NextClass !== 'function') {
      throw new Error('Expected a constructor.');
    }

    CurrentClass = NextClass;

    prototypeProxy.update(NextClass.prototype);
    ProxyClass.prototype = trackMount(
      prototypeProxy.get(),
      mountedInstances
    );

    // Wow, this is dense!
    // I have no idea what's going on here, but it works.
    ProxyClass.prototype.__proto__ = NextClass.prototype;
    ProxyClass.prototype.constructor = ProxyClass;
    ProxyClass.prototype.constructor.__proto__ = NextClass;

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