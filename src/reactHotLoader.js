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
import {
  increment as incrementGeneration,
  hotComparisonOpen,
  enterHotUpdate,
} from './global/generation'
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
  isRegisteredComponent,
} from './reconciler/proxies'
import configuration from './configuration'
import logger from './logger'

import { preactAdapter } from './adapters/preact'
import { areSwappable } from './reconciler/utils'
import { PROXY_KEY, UNWRAP_PROXY } from './proxy'
import AppContainer from './AppContainer.dev'

const forceSimpleSFC = { proxy: { pureSFC: true } }
const lazyConstructor = '_ctor'

const updateLazy = (target, type) => {
  const ctor = type[lazyConstructor]
  if (target[lazyConstructor] !== type[lazyConstructor]) {
    ctor()
  }
  if (!target[lazyConstructor].isPatchedByReactHotLoader) {
    target[lazyConstructor] = () =>
      ctor().then(m => {
        const C = resolveType(m.default)
        // chunks has been updated - new hot loader process is taking a place
        enterHotUpdate()
        return {
          default: props => (
            <AppContainer>
              <C {...props} />
            </AppContainer>
          ),
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

export const hotComponentCompare = (oldType, newType, setNewType) => {
  let defaultResult = oldType === newType

  if ((oldType && !newType) || (!oldType && newType)) {
    return false
  }

  if (isRegisteredComponent(oldType) || isRegisteredComponent(newType)) {
    if (resolveType(oldType) !== resolveType(newType)) {
      return false
    }
    defaultResult = true
  }

  const hotActive = hotComparisonOpen()

  if (isForwardType({ type: oldType }) && isForwardType({ type: newType })) {
    if (
      oldType.render === newType.render ||
      areSwappable(oldType.render, newType.render)
    ) {
      if (hotActive) {
        setNewType(newType)
      }
      return true
    }
    return defaultResult
  }

  if (isMemoType({ type: oldType }) && isMemoType({ type: newType })) {
    if (
      oldType.type === newType.type ||
      areSwappable(oldType.type, newType.type)
    ) {
      if (hotActive) {
        setNewType(newType.type)
      }
      return true
    }
    return defaultResult
  }

  if (newType !== oldType && areSwappable(newType, oldType)) {
    if (hotActive) {
      const unwrapFactory = newType[UNWRAP_PROXY]
      const oldProxy = unwrapFactory && getProxyByType(unwrapFactory())
      if (oldProxy) {
        oldProxy.dereference()
        updateProxyById(oldType[PROXY_KEY], newType[UNWRAP_PROXY]())
        updateProxyById(newType[PROXY_KEY], oldType[UNWRAP_PROXY]())
      } else {
        setNewType(newType)
      }
    }
    return true
  }

  return defaultResult
}

const shouldNotPatchComponent = type => isTypeBlacklisted(type)

function resolveType(type, options = {}) {
  if (isLazyType({ type }) || isMemoType({ type }) || isForwardType({ type })) {
    return getProxyByType(type) || type
  }

  if (!isCompositeComponent(type) || isProxyType(type)) {
    return type
  }

  const existingProxy = getProxyByType(type)

  if (shouldNotPatchComponent(type)) {
    return existingProxy ? existingProxy.getCurrent() : type
  }

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
  IS_REACT_MERGE_ENABLED: false,
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

        if (!reactHotLoader.IS_REACT_MERGE_ENABLED) {
          if (
            isTypeBlacklisted(type) ||
            isTypeBlacklisted(proxy.getCurrent())
          ) {
            logger.error(
              'React-hot-loader: Cold component',
              uniqueLocalName,
              'at',
              fileName,
              'has been updated',
            )
          }
        }
      }

      if (configuration.onComponentRegister) {
        configuration.onComponentRegister(type, uniqueLocalName, fileName)
      }
      if (configuration.onComponentCreate) {
        configuration.onComponentCreate(type, getComponentDisplayName(type))
      }

      registerComponent(updateProxyById(id, type, options).get(), 2)
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
    /* eslint-disable no-console */
    if (ReactDOM.setHotElementComparator) {
      ReactDOM.setHotElementComparator(hotComponentCompare)
      configuration.disableHotRenderer =
        configuration.disableHotRendererWhenInjected

      reactHotLoader.IS_REACT_MERGE_ENABLED = true
      console.info(
        'React-Hot-Loader: react-🔥-dom patch detected. You may use all the features.',
      )
    } else {
      console.warn(
        'React-Hot-Loader: react-🔥-dom patch is not detected. React 16.6+ features may not work.',
      )
    }
    /* eslint-enable */
    if (!React.createElement.isPatchedByReactHotLoader) {
      const originalCreateElement = React.createElement
      // Trick React into rendering a proxy so that
      // its state is preserved when the class changes.
      // This will update the proxy if it's for a known type.
      React.createElement = (type, ...args) =>
        originalCreateElement(resolveType(type), ...args)
      React.createElement.isPatchedByReactHotLoader = true
    }

    if (!React.cloneElement.isPatchedByReactHotLoader) {
      const originalCloneElement = React.cloneElement

      React.cloneElement = (element, ...args) => {
        const newType = element.type && resolveType(element.type)
        if (newType && newType !== element.type) {
          return originalCloneElement(
            {
              ...element,
              type: newType,
            },
            ...args,
          )
        }
        return originalCloneElement(element, ...args)
      }

      React.cloneElement.isPatchedByReactHotLoader = true
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
