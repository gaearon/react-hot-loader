import { didUpdate } from './updateCounter'
import {
  updateProxyById,
  resetProxies,
  getProxyByType,
  createProxyForType,
} from './reconciler/proxies'

function resolveType(type, disableComponentProxy) {
  // We only care about composite components
  if (typeof type !== 'function') {
    return type
  }

  // is proxing is disabled - do not create auto proxies, but use the old ones
  const proxy = disableComponentProxy
    ? getProxyByType(type)
    : createProxyForType(type)

  return proxy ? proxy.get() : type
}

const reactHotLoader = {
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

    updateProxyById(`${fileName}#${uniqueLocalName}`, type)
  },

  reset: resetProxies,

  patch(React) {
    if (!React.createElement.isPatchedByReactHotLoader) {
      const originalCreateElement = React.createElement
      React.createElement = (type, ...args) => {
        // Trick React into rendering a proxy so that
        // its state is preserved when the class changes.
        // This will update the proxy if it's for a known type.
        const resolvedType = resolveType(
          type,
          reactHotLoader.disableComponentProxy,
        )
        return originalCreateElement(resolvedType, ...args)
      }
      React.createElement.isPatchedByReactHotLoader = true
    }

    if (!React.createFactory.isPatchedByReactHotLoader) {
      React.createFactory = type => {
        // Patch React.createFactory to use patched createElement
        // because the original implementation uses the internal,
        // unpatched ReactElement.createElement
        const factory = React.createElement.bind(null, type)
        factory.type = type
        return factory
      }
      React.createFactory.isPatchedByReactHotLoader = true
    }

    if (!React.Children.only.isPatchedByReactHotLoader) {
      const originalChildrenOnly = React.Children.only
      React.Children.only = element =>
        originalChildrenOnly({ ...element, type: resolveType(element.type) })
      React.Children.only.isPatchedByReactHotLoader = true
    }

    reactHotLoader.reset()
  },

  disableComponentProxy: false,

  config: {
    logLevel: 'error',
  },
}

export default reactHotLoader
