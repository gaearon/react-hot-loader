import React from 'react';
import createProxy from './createProxy';

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

export default function createPatch() {
  const proxyTo = createProxy({});
  const mountedInstances = [];
  let CurrentClass = null;

  function HotClass() {
    CurrentClass.apply(this, arguments);
  }

  return function hotify(NextClass) {
    CurrentClass = NextClass;

    // Wow, this is dense!
    // I have no idea what's going on here, but it works.
    HotClass.prototype = trackMount(proxyTo(NextClass.prototype), mountedInstances);
    HotClass.prototype.__proto__ = NextClass.prototype;
    HotClass.prototype.constructor = HotClass;
    HotClass.prototype.constructor.__proto__ = NextClass;

    mountedInstances.forEach(forceUpdate);

    return HotClass;
  };
}