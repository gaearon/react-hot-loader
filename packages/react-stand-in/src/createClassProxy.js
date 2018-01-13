import { Component } from 'react'
import transferStaticProps from './transferStaticProps'
import { GENERATION, PROXY_KEY, UNWRAP_PROXY, CACHED_RESULT } from './constants'
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

  function proxiedRender() {
    inject(this, proxyGeneration, injectedMembers)

    let result

    if (this[CACHED_RESULT]) {
      result = this[CACHED_RESULT]
      delete this[CACHED_RESULT]
    } else if (isFunctionalComponent) {
      result = CurrentComponent(this.props, this.context)
    } else {
      result = CurrentComponent.prototype.render.call(this)
    }

    return wrapResult(result)
  }

  let ProxyFacade
  let ProxyComponent = null

  if (!isFunctionalComponent) {
    ProxyComponent = proxyClassCreator(InitialComponent, postConstructionAction)
    safeDefineProperty(ProxyComponent.prototype, 'render', {
      configurable: false,
      writable: false,
      enumerable: false,
      value: proxiedRender,
    })

    // ProxyComponent.prototype.render = proxiedRender

    ProxyFacade = ProxyComponent
  } else {
    // This function only gets called for the initial mount. The actual
    // rendered component instance will be the return value.
    ProxyFacade = function(props, context) {
      // eslint-disable-line func-names
      const result = CurrentComponent(props, context)

      // This is a Relay-style container constructor. We can't do the prototype-
      // style wrapping for this as we do elsewhere, so just we just pass it
      // through as-is.
      if (isReactIndeterminateResult(result)) {
        ProxyComponent = null
        return result
      }

      // Otherwise, it's a normal functional component. Build the real proxy
      // and use it going forward.
      ProxyComponent = proxyClassCreator(Component, postConstructionAction)
      ProxyComponent.prototype.render = proxiedRender

      const determinateResult = new ProxyComponent(props, context)

      // Cache the initial result so we don't call the component function a
      // second time for the initial render.
      determinateResult[CACHED_RESULT] = result
      return determinateResult
    }
  }

  function get() {
    return ProxyFacade
  }

  function getCurrent() {
    return CurrentComponent
  }

  safeDefineProperty(ProxyFacade, UNWRAP_PROXY, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: getCurrent,
  })

  safeDefineProperty(ProxyFacade, PROXY_KEY, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: proxyKey,
  })

  safeDefineProperty(ProxyFacade, 'toString', {
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
    ProxyFacade.displayName = displayName

    safeDefineProperty(ProxyComponent, 'name', {
      value: displayName,
    })

    savedDescriptors = transferStaticProps(
      ProxyFacade,
      savedDescriptors,
      PreviousComponent,
      NextComponent,
    )

    if (isFunctionalComponent || !ProxyComponent) {
      // nothing
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
  proxies.set(ProxyFacade, proxy)

  Object.defineProperty(proxy, UNWRAP_PROXY, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: getCurrent,
  })

  return proxy
}

export default createClassProxy
