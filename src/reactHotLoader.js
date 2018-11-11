/* eslint-disable no-use-before-define */
import React from 'react'
import ReactDOM from 'react-dom'
import {
  isCompositeComponent,
  getComponentDisplayName,
  isLazyType,
  isMemoType,
  isForwardType,
} from './internal/reactUtils'
import { increment as incrementGeneration } from './global/generation'
import {
  updateProxyById,
  resetProxies,
  isProxyType,
  getProxyByType,
  getProxyById,
  createProxyForType,
  isTypeBlacklisted,
  registerComponent,
  updateFunctionProxyById,
} from './reconciler/proxies'
import configuration from './configuration'
import logger from './logger'

import { preactAdapter } from './adapters/preact'
import { areSwappable } from './reconciler/utils'
import { PROXY_KEY, UNWRAP_PROXY } from './proxy'

const forceSimpleSFC = { proxy: { allowSFC: false } }
const lazyConstructor = '_ctor'

const updateLazy = (target, type) => {
  const ctor = type[lazyConstructor]
  if (target[lazyConstructor] !== type[lazyConstructor]) {
    // ctor()
  }
  if (!target[lazyConstructor].isPatchedByReactHotLoader) {
    target[lazyConstructor] = () =>
      ctor().then(m => {
        const C = resolveType(m.default)
        return {
          default: props => <C {...props} />,
        }
      })
    target[lazyConstructor].isPatchedByReactHotLoader = true
  }
}
const updateMemo = (target, { type }) => {
  target.type = resolveType(type)
}
const updateForward = (target, { render }) => {
  target.render = render
}

export const hotComponentCompare = (oldType, newType) => {
  if (oldType === newType) {
    return true
  }

  if (isForwardType({ type: oldType }) && isForwardType({ type: newType })) {
    return areSwappable(oldType.render, newType.render)
  }

  if (areSwappable(newType, oldType)) {
    const oldProxy = getProxyByType(newType[UNWRAP_PROXY]())
    if (oldProxy) {
      oldProxy.dereference()
      updateProxyById(oldType[PROXY_KEY], newType[UNWRAP_PROXY]())
      updateProxyById(newType[PROXY_KEY], oldType[UNWRAP_PROXY]())
    }
    return true
  }

  return false
}

const shouldNotPatchComponent = type =>
  !isCompositeComponent(type) || isTypeBlacklisted(type) || isProxyType(type)

function resolveType(type, options = {}) {
  if (isLazyType({ type }) || isMemoType({ type }) || isForwardType({ type })) {
    return getProxyByType(type) || type
  }

  if (shouldNotPatchComponent(type)) return type

  const existingProxy = getProxyByType(type)

  if (!existingProxy && configuration.onComponentCreate) {
    configuration.onComponentCreate(type, getComponentDisplayName(type))
    if (shouldNotPatchComponent(type)) return type
  }

  const proxy = reactHotLoader.disableProxyCreation
    ? existingProxy
    : createProxyForType(type, options)

  return proxy ? proxy.get() : type
}

const reactHotLoader = {
  register(type, uniqueLocalName, fileName, options = {}) {
    const id = `${fileName}#${uniqueLocalName}`

    if (
      isCompositeComponent(type) &&
      typeof uniqueLocalName === 'string' &&
      uniqueLocalName &&
      typeof fileName === 'string' &&
      fileName
    ) {
      const proxy = getProxyById(id)

      if (proxy && proxy.getCurrent() !== type) {
        // component got replaced. Need to reconcile
        incrementGeneration()

        if (isTypeBlacklisted(type) || isTypeBlacklisted(proxy.getCurrent())) {
          logger.error(
            'React-hot-loader: Cold component',
            uniqueLocalName,
            'at',
            fileName,
            'has been updated',
          )
        }
      }

      if (configuration.onComponentRegister) {
        configuration.onComponentRegister(type, uniqueLocalName, fileName)
      }
      if (configuration.onComponentCreate) {
        configuration.onComponentCreate(type, getComponentDisplayName(type))
      }

      updateProxyById(id, type, options)
      registerComponent(type)
    }
    if (isLazyType({ type })) {
      updateFunctionProxyById(id, type, updateLazy)
      incrementGeneration()
    }
    if (isForwardType({ type })) {
      updateFunctionProxyById(id, type, updateForward)
      incrementGeneration()
    }
    if (isMemoType({ type })) {
      reactHotLoader.register(
        type.type,
        `${uniqueLocalName}:memo`,
        fileName,
        forceSimpleSFC,
      )
      updateFunctionProxyById(id, type, updateMemo)
      incrementGeneration()
    }
  },

  reset() {
    resetProxies()
  },

  preact(instance) {
    preactAdapter(instance, resolveType)
  },

  resolveType(type) {
    return resolveType(type)
  },

  patch(React) {
    if (ReactDOM.setHotElementComparator) {
      ReactDOM.setHotElementComparator(hotComponentCompare)
      configuration.disableHotRenderer =
        configuration.disableHotRendererWhenInjected
    }
    if (!React.createElement.isPatchedByReactHotLoader) {
      const originalCreateElement = React.createElement
      // Trick React into rendering a proxy so that
      // its state is preserved when the class changes.
      // This will update the proxy if it's for a known type.
      React.createElement = (type, ...args) =>
        originalCreateElement(resolveType(type), ...args)
      React.createElement.isPatchedByReactHotLoader = true
    }

    if (!React.createFactory.isPatchedByReactHotLoader) {
      // Patch React.createFactory to use patched createElement
      // because the original implementation uses the internal,
      // unpatched ReactElement.createElement
      React.createFactory = type => {
        const factory = React.createElement.bind(null, type)
        factory.type = type
        return factory
      }
      React.createFactory.isPatchedByReactHotLoader = true
    }

    if (!React.Children.only.isPatchedByReactHotLoader) {
      const originalChildrenOnly = React.Children.only
      // Use the same trick as React.createElement
      React.Children.only = children =>
        originalChildrenOnly({ ...children, type: resolveType(children.type) })
      React.Children.only.isPatchedByReactHotLoader = true
    }

    reactHotLoader.reset()
  },

  disableProxyCreation: false,
}

export default reactHotLoader
