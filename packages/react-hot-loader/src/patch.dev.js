import global from 'global'
import React from 'react'
import { didUpdate } from './updateCounter'
import {
  updateProxyById,
  resetProxies,
  getProxyByType,
  createProxyForType,
} from './reconciler/proxies'

const hooks = {
  register(type, uniqueLocalName, fileName) {
    didUpdate()

    if (typeof type !== 'function') {
      return
    }
    if (!uniqueLocalName || !fileName) {
      return
    }
    if (typeof uniqueLocalName !== 'string' || typeof fileName !== 'string') {
      return
    }
    const id = fileName + '#' + uniqueLocalName // eslint-disable-line prefer-template

    updateProxyById(id, type)
  },

  reset(useWeakMap) {
    resetProxies(useWeakMap)
  },

  warnings: true,
  disableComponentProxy: false,
}

hooks.reset()

function resolveType(type) {
  const { disableComponentProxy } = __REACT_HOT_LOADER__
  // We only care about composite components
  if (typeof type !== 'function') {
    return type
  }

  // always could...
  const couldWrapWithProxy = true

  // is proxing is disabled - do not create auto proxies, but use the old ones
  const proxy =
    !disableComponentProxy && couldWrapWithProxy
      ? createProxyForType(type)
      : getProxyByType(type)

  if (!proxy) {
    return type
  }

  return proxy.get()
}

const { createElement: originalCreateElement } = React
const childrenOnly = React.Children.only

function patchedCreateElement(type, ...args) {
  // Trick React into rendering a proxy so that
  // its state is preserved when the class changes.
  // This will update the proxy if it's for a known type.
  const resolvedType = resolveType(type)
  return originalCreateElement(resolvedType, ...args)
}

patchedCreateElement.isPatchedByReactHotLoader = true

function patchedCreateFactory(type) {
  // Patch React.createFactory to use patched createElement
  // because the original implementation uses the internal,
  // unpatched ReactElement.createElement
  const factory = patchedCreateElement.bind(null, type)
  factory.type = type
  return factory
}

patchedCreateFactory.isPatchedByReactHotLoader = true

function patchedChildOnly(element) {
  return childrenOnly(
    Object.assign({}, element, {
      type: resolveType(element.type),
    }),
  )
}

if (typeof global.__REACT_HOT_LOADER__ === 'undefined') {
  React.createElement = patchedCreateElement
  React.createFactory = patchedCreateFactory
  React.Children.only = patchedChildOnly
  global.__REACT_HOT_LOADER__ = hooks
}
