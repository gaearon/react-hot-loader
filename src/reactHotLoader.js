/* eslint-disable no-use-before-define */
import {
  getComponentDisplayName,
  isCompositeComponent,
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
} from './reconciler/proxies'
import configuration from './configuration'
import logger from './logger'

import { preactAdapter } from './adapters/preact'

const shouldNotPatchComponent = type =>
  !isCompositeComponent(type) || isTypeBlacklisted(type) || isProxyType(type)

function resolveType(type) {
  if (shouldNotPatchComponent(type)) return type

  const existingProxy = getProxyByType(type)

  if (!existingProxy && configuration.onComponentCreate) {
    configuration.onComponentCreate(type, getComponentDisplayName(type))
    if (shouldNotPatchComponent(type)) return type
  }

  const proxy = reactHotLoader.disableProxyCreation
    ? existingProxy
    : createProxyForType(type)

  return proxy ? proxy.get() : type
}

const reactHotLoader = {
  register(type, uniqueLocalName, fileName) {
    if (
      isCompositeComponent(type) &&
      typeof uniqueLocalName === 'string' &&
      uniqueLocalName &&
      typeof fileName === 'string' &&
      fileName
    ) {
      const id = `${fileName}#${uniqueLocalName}`
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

      updateProxyById(id, type)
      registerComponent(type)
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
