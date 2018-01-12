import { Component } from 'react'
import transferStaticProps from './transferStaticProps'
import { GENERATION, PROXY_KEY, UNWRAP_PROXY } from './constants'
import {
  getDisplayName,
  isReactClass,
  isReactIndeterminateResult,
  identity,
  safeDefineProperty,
  proxyClassCreator,
} from './utils'
import { inject, checkLifeCycleMethods, mergeComponents } from './inject'

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

  let lastInstance = null

  function postConstructionAction() {
    this[GENERATION] = 0

    // As long we can't override constructor
    // every class shall evolve from a base class
    inject(this, proxyGeneration, injectedMembers)

    lastInstance = this
  }

  let hasInitialResult = false
  let initialResult = null

  function proxiedRender() {
    inject(this, proxyGeneration, injectedMembers)

    let result

    if (hasInitialResult) {
      result = initialResult
      hasInitialResult = false
      initialResult = null
    } else if (isFunctionalComponent) {
      result = CurrentComponent(this.props, this.context)
    } else {
      result = CurrentComponent.prototype.render.call(this)
    }

    return wrapResult(result)
  }

  let ProxyComponent
  let ActualProxyComponent = null

  if (!isFunctionalComponent) {
    ProxyComponent = proxyClassCreator(InitialComponent, postConstructionAction)
    ProxyComponent.prototype.render = proxiedRender

    ActualProxyComponent = ProxyComponent
  } else {
    // This function only gets called for the initial mount. The actual
    // rendered component instance will be the return value.
    ProxyComponent = function(props, context) {
      const result = CurrentComponent(props, context)

      // This is a Relay-style container constructor. We can't do the prototype-
      // style wrapping for this as we do elsewhere, so just we just pass it
      // through as-is.
      if (isReactIndeterminateResult(result)) {
        ActualProxyComponent = null
        return result
      }

      // Otherwise, it's a normal functional component. Build the real proxy
      // and use it going forward.
      ActualProxyComponent = proxyClassCreator(
        Component,
        postConstructionAction,
      )
      ActualProxyComponent.prototype.render = proxiedRender

      // Cache the initial result so we don't call the component function a
      // second time for the initial render.
      hasInitialResult = true
      initialResult = result

      return new ActualProxyComponent(props, context)
    }
  }

  function get() {
    return ProxyComponent
  }

  function getCurrent() {
    return CurrentComponent
  }

  safeDefineProperty(ProxyComponent, UNWRAP_PROXY, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: getCurrent,
  })

  safeDefineProperty(ProxyComponent, PROXY_KEY, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: proxyKey,
  })

  safeDefineProperty(ProxyComponent, 'toString', {
    configurable: true,
    writable: false,
    enumerable: false,
    value: function toString() {
      return String(CurrentComponent)
    },
  })

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

    safeDefineProperty(ProxyComponent, 'name', {
      value: displayName,
    })

    savedDescriptors = transferStaticProps(
      ProxyComponent,
      savedDescriptors,
      PreviousComponent,
      NextComponent,
    )

    if (isFunctionalComponent || !ActualProxyComponent) {
      // nothing
    } else {
      checkLifeCycleMethods(ActualProxyComponent, NextComponent)
      Object.setPrototypeOf(
        ActualProxyComponent.prototype,
        NextComponent.prototype,
      )
      if (proxyGeneration > 1) {
        injectedMembers = mergeComponents(
          ActualProxyComponent,
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
