import {Component} from 'react';
import transferStaticProps from './staticProps';
import {GENERATION} from "./symbols";
import {addProxy, findProxy} from "./proxies";
import {getDisplayName, isReactClass} from './react-utils';
import {inject, checkLifeCycleMethods, mergeComponents} from "./inject";

function proxyClass(InitialComponent) {
  // Prevent double wrapping.
  // Given a proxy class, return the existing proxy managing it.
  var existingProxy = findProxy(InitialComponent);
  if (existingProxy) {
    return existingProxy;
  }

  let CurrentComponent;
  let PreviousComponents = [];
  let ProxyComponent;
  let savedDescriptors = {};
  let injectedMembers = {};
  let proxyGeneration = 0;
  let isFunctionalComponent = !isReactClass(InitialComponent);

  let StatelessProxyComponent = class StatelessProxyComponent extends Component {
    render() {
      return CurrentComponent(this.props, this.context);
    }
  };

  let InitialParent = isFunctionalComponent
    ? StatelessProxyComponent
    : InitialComponent;

  ProxyComponent = class extends InitialParent {
    constructor(props, context) {
      super(props, context);
      this[GENERATION] = proxyGeneration;
    }

    render() {
      inject(this, proxyGeneration, injectedMembers);
      return isFunctionalComponent
        ? CurrentComponent(this.props, this.context)
        : CurrentComponent.prototype.render.call(this)
    }
  };

  ProxyComponent.toString = function toString() {
    return CurrentComponent.toString();
  };

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
      return update(existingProxy.__standin_getCurrent());
    }

    isFunctionalComponent = !isReactClass(NextComponent);
    proxyGeneration++;
    injectedMembers = {};

    // Save the next constructor so we call it
    const PreviousComponent = CurrentComponent;
    if(PreviousComponent) {
      PreviousComponents.push(PreviousComponent);
    }
    CurrentComponent = NextComponent;

    // Try to infer displayName

    const displayName = getDisplayName(CurrentComponent);
    ProxyComponent.displayName = displayName;

    try {
      Object.defineProperty(ProxyComponent, 'name', {
        value: displayName
      });
    } catch (err) {
    }

    savedDescriptors = transferStaticProps(ProxyComponent, savedDescriptors, PreviousComponent, NextComponent);

    if (isReactClass(NextComponent)) {
      checkLifeCycleMethods(ProxyComponent, NextComponent);
      Object.setPrototypeOf(ProxyComponent.prototype, NextComponent.prototype);
      if (proxyGeneration > 1) {
        injectedMembers = mergeComponents(ProxyComponent, NextComponent, PreviousComponents);
        ///

      }
    } else {
      ProxyComponent.prototype.prototype = StatelessProxyComponent.prototype;
    }
  };

  function get() {
    return ProxyComponent;
  }

  function getCurrent() {
    return CurrentComponent;
  }

  update(InitialComponent);

  const proxy = {get, update};
  addProxy(ProxyComponent, proxy);

  Object.defineProperty(proxy, '__standin_getCurrent', {
    configurable: false,
    writable: false,
    enumerable: false,
    value: getCurrent
  });

  return proxy;
}

export default proxyClass;
