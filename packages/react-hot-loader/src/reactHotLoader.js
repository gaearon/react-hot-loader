/* eslint-disable no-use-before-define */
import { isCompositeComponent } from './internal/reactUtils'
import { increment as incrementGeneration } from './global/generation'
import {
  updateProxyById,
  resetProxies,
  getProxyByType,
  createProxyForType,
} from './reconciler/proxies'
import './reconciler/proxyAdapter'

function resolveType(type) {
  if (!isCompositeComponent(type)) return type

  const proxy = reactHotLoader.disableProxyCreation
    ? getProxyByType(type)
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
      incrementGeneration()
      updateProxyById(`${fileName}#${uniqueLocalName}`, type)
    }
  },

  reset() {
    resetProxies()
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

  config: {
    logLevel: 'error',
  },
}

export default reactHotLoader
