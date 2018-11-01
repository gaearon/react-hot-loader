/* eslint-disable no-use-before-define */
import {
  isCompositeComponent,
  isLazyType,
  isMemoType,
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

const forceSimpleSFC = { proxy: { allowSFC: false } }
const lazyConstructor = '_ctor'

function resolveType(type, options = {}) {
  if (isLazyType({ type })) {
    const proxy = getProxyByType(type)
    if (proxy) {
      proxy.check(type[lazyConstructor])
      return proxy.get()
    }
  }
  if (isMemoType({ type })) {
    return {
      ...type,
      type: resolveType(type.type, forceSimpleSFC),
    }
  }
  if (
    !isCompositeComponent(type) ||
    isTypeBlacklisted(type) ||
    isProxyType(type)
  )
    return type

  const proxy = reactHotLoader.disableProxyCreation
    ? getProxyByType(type)
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

      updateProxyById(id, type, options)
      registerComponent(type)
    }
    if (isLazyType({ type })) {
      updateFunctionProxyById(id, type)
    }
    if (isMemoType({ type })) {
      reactHotLoader.register(
        type.type,
        uniqueLocalName,
        fileName,
        forceSimpleSFC,
      )
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
