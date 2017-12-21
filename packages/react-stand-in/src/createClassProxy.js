import { Component } from 'react'
import transferStaticProps from './staticProps'
import { GENERATION, PROXY_KEY } from './symbols'
import { addProxy, findProxy } from './proxies'
import { getDisplayName, isReactClass } from './react-utils'
import { inject, checkLifeCycleMethods, mergeComponents } from './inject'

function proxyClass(InitialComponent, proxyKey) {
  // Prevent double wrapping.
  // Given a proxy class, return the existing proxy managing it.
  const existingProxy = findProxy(InitialComponent)
  if (existingProxy) {
    return existingProxy
  }

  let CurrentComponent
  let savedDescriptors = {}
  let injectedMembers = {}
  let proxyGeneration = 0
  let isFunctionalComponent = !isReactClass(InitialComponent)

  const StatelessProxyComponent = class StatelessProxyComponent extends Component {
    render() {
      return CurrentComponent(this.props, this.context)
    }
  }

  const InitialParent = isFunctionalComponent
    ? StatelessProxyComponent
    : InitialComponent

  const ProxyComponent = class extends InitialParent {
    constructor(props, context) {
      super(props, context)
      this[GENERATION] = 0
      this[PROXY_KEY] = proxyKey
      // as long we cant override constructor
      // every class shall evolve from a base class
      inject(this, proxyGeneration, injectedMembers)
    }

    render() {
      inject(this, proxyGeneration, injectedMembers)
      return isFunctionalComponent
        ? CurrentComponent(this.props, this.context)
        : CurrentComponent.prototype.render.call(this)
    }
  }

  ProxyComponent.toString = function toString() {
    return CurrentComponent.toString()
  }

  function update(NextComponent) {
    if (typeof NextComponent !== 'function') {
      throw new Error('Expected a constructor.')
    }
    if (NextComponent === CurrentComponent) {
      return
    }

    // Prevent proxy cycles
    const existingProxy = findProxy(NextComponent)
    if (existingProxy) {
      update(existingProxy.__standin_getCurrent())
      return
    }

    isFunctionalComponent = !isReactClass(NextComponent)
    proxyGeneration++
    injectedMembers = {}

    // Save the next constructor so we call it
    const PreviousComponent = CurrentComponent
    CurrentComponent = NextComponent

    // Try to infer displayName

    const displayName = getDisplayName(CurrentComponent)
    ProxyComponent.displayName = displayName

    try {
      Object.defineProperty(ProxyComponent, 'name', {
        value: displayName,
      })
    } catch (err) {}

    savedDescriptors = transferStaticProps(
      ProxyComponent,
      savedDescriptors,
      PreviousComponent,
      NextComponent,
    )

    if (isReactClass(NextComponent)) {
      checkLifeCycleMethods(ProxyComponent, NextComponent)
      Object.setPrototypeOf(ProxyComponent.prototype, NextComponent.prototype)
      if (proxyGeneration > 1) {
        injectedMembers = mergeComponents(
          ProxyComponent,
          NextComponent,
          InitialComponent,
        )
      }
    } else {
      ProxyComponent.prototype.prototype = StatelessProxyComponent.prototype
    }
  }

  function get() {
    return ProxyComponent
  }

  function getCurrent() {
    return CurrentComponent
  }

  update(InitialComponent)

  const proxy = { get, update }
  addProxy(ProxyComponent, proxy)

  Object.defineProperty(proxy, '__standin_getCurrent', {
    configurable: false,
    writable: false,
    enumerable: false,
    value: getCurrent,
  })

  return proxy
}

export default proxyClass
