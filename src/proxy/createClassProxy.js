import { Component } from 'react'
import transferStaticProps from './transferStaticProps'
import {
  GENERATION,
  PROXY_KEY,
  UNWRAP_PROXY,
  CACHED_RESULT,
  PROXY_IS_MOUNTED,
} from './constants'
import {
  getDisplayName,
  isReactClass,
  isReactComponentInstance,
  identity,
  safeDefineProperty,
  proxyClassCreator,
} from './utils'
import { inject, checkLifeCycleMethods, mergeComponents } from './inject'

const has = Object.prototype.hasOwnProperty

let proxies = new WeakMap()

export const resetClassProxies = () => {
  proxies = new WeakMap()
}

const blackListedClassMembers = [
  'constructor',
  'render',
  'componentWillMount',
  'componentDidMount',
  'componentWillReceiveProps',
  'componentWillUnmount',
  'hotComponentRender',

  'getInitialState',
  'getDefaultProps',
]

const defaultRenderOptions = {
  componentWillRender: identity,
  componentDidUpdate: result => result,
  componentDidRender: result => result,
}

const defineClassMember = (Class, methodName, methodBody) =>
  safeDefineProperty(Class.prototype, methodName, {
    configurable: true,
    writable: true,
    enumerable: false,
    value: methodBody,
  })

const defineClassMembers = (Class, methods) =>
  Object.keys(methods).forEach(methodName =>
    defineClassMember(Class, methodName, methods[methodName]),
  )

const setSFPFlag = (component, flag) =>
  safeDefineProperty(component, 'isStatelessFunctionalProxy', {
    configurable: false,
    writable: false,
    enumerable: false,
    value: flag,
  })

const copyMethodDescriptors = (target, source) => {
  if (source) {
    // it is possible to use `function-double` to construct an ideal clone, but does not make a sence
    const keys = Object.getOwnPropertyNames(source)

    keys.forEach(key =>
      safeDefineProperty(
        target,
        key,
        Object.getOwnPropertyDescriptor(source, key),
      ),
    )

    safeDefineProperty(target, 'toString', {
      configurable: true,
      writable: false,
      enumerable: false,
      value: function toString() {
        return String(source)
      },
    })
  }

  return target
}

function createClassProxy(InitialComponent, proxyKey, options) {
  const renderOptions = {
    ...defaultRenderOptions,
    ...options,
  }
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

  function proxiedUpdate() {
    if (this) {
      inject(this, proxyGeneration, injectedMembers)
    }
  }

  function lifeCycleWrapperFactory(wrapperName, sideEffect = identity) {
    return copyMethodDescriptors(function wrappedMethod(...rest) {
      proxiedUpdate.call(this)
      sideEffect(this)
      return (
        !isFunctionalComponent &&
        CurrentComponent.prototype[wrapperName] &&
        CurrentComponent.prototype[wrapperName].apply(this, rest)
      )
    }, InitialComponent.prototype && InitialComponent.prototype[wrapperName])
  }

  function methodWrapperFactory(wrapperName, realMethod) {
    return copyMethodDescriptors(function wrappedMethod(...rest) {
      return realMethod.apply(this, rest)
    }, realMethod)
  }

  const fakeBasePrototype = Base =>
    Object.getOwnPropertyNames(Base)
      .filter(key => blackListedClassMembers.indexOf(key) === -1)
      .filter(key => {
        const descriptor = Object.getOwnPropertyDescriptor(Base, key)
        return typeof descriptor.value === 'function'
      })
      .reduce((acc, key) => {
        acc[key] = methodWrapperFactory(key, Base[key])
        return acc
      }, {})

  const componentDidMount = lifeCycleWrapperFactory(
    'componentDidMount',
    target => {
      target[PROXY_IS_MOUNTED] = true
    },
  )
  const componentDidUpdate = lifeCycleWrapperFactory(
    'componentDidUpdate',
    renderOptions.componentDidUpdate,
  )
  const componentWillUnmount = lifeCycleWrapperFactory(
    'componentWillUnmount',
    target => {
      target[PROXY_IS_MOUNTED] = false
    },
  )

  function hotComponentRender() {
    // repeating subrender call to keep RENDERED_GENERATION up to date
    renderOptions.componentWillRender(this)
    proxiedUpdate.call(this)
    let result

    // We need to use hasOwnProperty here, as the cached result is a React node
    // and can be null or some other falsy value.
    if (has.call(this, CACHED_RESULT)) {
      result = this[CACHED_RESULT]
      delete this[CACHED_RESULT]
    } else if (isFunctionalComponent) {
      result = CurrentComponent(this.props, this.context)
    } else {
      result = CurrentComponent.prototype.render.call(this)
    }

    return renderOptions.componentDidRender.call(this, result)
  }

  function proxiedRender() {
    renderOptions.componentWillRender(this)
    return hotComponentRender.call(this)
  }

  const defineProxyMethods = (Proxy, Base = {}) => {
    defineClassMembers(Proxy, {
      ...fakeBasePrototype(Base),
      render: proxiedRender,
      hotComponentRender,
      componentDidMount,
      componentDidUpdate,
      componentWillUnmount,
    })
  }

  let ProxyFacade
  let ProxyComponent = null
  let proxy

  if (!isFunctionalComponent) {
    ProxyComponent = proxyClassCreator(InitialComponent, postConstructionAction)

    defineProxyMethods(ProxyComponent, InitialComponent.prototype)

    ProxyFacade = ProxyComponent
  } else {
    // This function only gets called for the initial mount. The actual
    // rendered component instance will be the return value.

    // eslint-disable-next-line func-names
    ProxyFacade = function(props, context) {
      const result = CurrentComponent(props, context)

      // simple SFC
      if (!CurrentComponent.contextTypes) {
        if (!ProxyFacade.isStatelessFunctionalProxy) {
          setSFPFlag(ProxyFacade, true)
        }

        return renderOptions.componentDidRender(result)
      }
      setSFPFlag(ProxyFacade, false)

      // This is a Relay-style container constructor. We can't do the prototype-
      // style wrapping for this as we do elsewhere, so just we just pass it
      // through as-is.
      if (isReactComponentInstance(result)) {
        ProxyComponent = null
        return result
      }

      // Otherwise, it's a normal functional component. Build the real proxy
      // and use it going forward.
      ProxyComponent = proxyClassCreator(Component, postConstructionAction)

      defineProxyMethods(ProxyComponent)

      const determinateResult = new ProxyComponent(props, context)

      // Cache the initial render result so we don't call the component function
      // a second time for the initial render.
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
      return
    }

    proxies.set(NextComponent, proxy)

    isFunctionalComponent = !isReactClass(NextComponent)
    proxyGeneration++

    // Save the next constructor so we call it
    const PreviousComponent = CurrentComponent
    CurrentComponent = NextComponent

    // Try to infer displayName
    const displayName = getDisplayName(CurrentComponent)

    safeDefineProperty(ProxyFacade, 'displayName', {
      configurable: true,
      writable: false,
      enumerable: true,
      value: displayName,
    })

    if (ProxyComponent) {
      safeDefineProperty(ProxyComponent, 'name', {
        value: displayName,
      })
    }

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
      defineProxyMethods(ProxyComponent, NextComponent.prototype)
      if (proxyGeneration > 1) {
        injectedMembers = mergeComponents(
          ProxyComponent,
          NextComponent,
          InitialComponent,
          lastInstance,
          injectedMembers,
        )
      }
    }
  }

  update(InitialComponent)

  proxy = { get, update }

  proxies.set(InitialComponent, proxy)
  proxies.set(ProxyFacade, proxy)

  safeDefineProperty(proxy, UNWRAP_PROXY, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: getCurrent,
  })

  return proxy
}

export default createClassProxy
