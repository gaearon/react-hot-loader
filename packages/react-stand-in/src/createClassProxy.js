import { Component } from 'react'
import transferStaticProps from './transferStaticProps'
import { GENERATION, PROXY_KEY, UNWRAP_PROXY } from './constants'
import { getDisplayName, isReactClass, identity } from './utils'
import { inject, checkLifeCycleMethods, mergeComponents } from './inject'
import config from './config'

const proxies = new WeakMap()

function createClassProxy(InitialComponent, proxyKey, wrapResult = identity) {
  // Prevent double wrapping.
  // Given a proxy class, return the existing proxy managing it.
  const existingProxy = proxies.get(InitialComponent)

  if (existingProxy) {
    return existingProxy
  }

  let CurrentComponent
  let savedDescriptors = {}
  let injectedMembers = {}
  let proxyGeneration = 0
  let isFunctionalComponent = !isReactClass(InitialComponent)

  class StatelessProxyComponent extends Component {
    render() {
      return CurrentComponent(this.props, this.context)
    }
  }

  const InitialParent = isFunctionalComponent
    ? StatelessProxyComponent
    : InitialComponent

  let lastInstance = null

  class ProxyComponent extends InitialParent {
    constructor(props, context) {
      super(props, context)

      this[GENERATION] = 0
      this[PROXY_KEY] = proxyKey

      // As long we can't override constructor
      // every class shall evolve from a base class
      inject(this, proxyGeneration, injectedMembers)

      lastInstance = this
    }

    // for beta testing only
    componentWillUnmount() {
      if (!isFunctionalComponent) {
        if (CurrentComponent.prototype.componentWillUnmount) {
          CurrentComponent.prototype.componentWillUnmount.call(this)
        }
      }
    }

    render() {
      inject(this, proxyGeneration, injectedMembers)

      const result = isFunctionalComponent
        ? CurrentComponent(this.props, this.context)
        : CurrentComponent.prototype.render.call(this)

      return wrapResult(result)
    }
  }

  function get() {
    return ProxyComponent
  }

  function getCurrent() {
    return CurrentComponent
  }

  try {
    ProxyComponent.toString = function toString() {
      return CurrentComponent.toString()
    }
  } catch (error) {
    config.logger.warn('Error while wrapping `toString`', error)
  }

  ProxyComponent[UNWRAP_PROXY] = getCurrent
  ProxyComponent.RHL_PROXY_ID = proxyKey

  function update(NextComponent) {
    if (typeof NextComponent !== 'function') {
      throw new Error('Expected a constructor.')
    }

    if (NextComponent === CurrentComponent) {
      return
    }

    // Prevent proxy cycles
    const existingProxy = proxies.get(NextComponent)
    if (existingProxy) {
      update(existingProxy[UNWRAP_PROXY]())
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
    } catch (error) {
      config.logger.warn('Error while wrapping `displayName`', error)
    }

    savedDescriptors = transferStaticProps(
      ProxyComponent,
      savedDescriptors,
      PreviousComponent,
      NextComponent,
    )

    if (isFunctionalComponent) {
      ProxyComponent.prototype.prototype = StatelessProxyComponent.prototype
    } else {
      checkLifeCycleMethods(ProxyComponent, NextComponent)
      Object.setPrototypeOf(ProxyComponent.prototype, NextComponent.prototype)
      if (proxyGeneration > 1) {
        injectedMembers = mergeComponents(
          ProxyComponent,
          NextComponent,
          InitialComponent,
          lastInstance,
        )
      }
    }
  }

  update(InitialComponent)

  const proxy = { get, update }
  proxies.set(ProxyComponent, proxy)

  Object.defineProperty(proxy, UNWRAP_PROXY, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: getCurrent,
  })

  return proxy
}

export default createClassProxy
