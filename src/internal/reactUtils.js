import React from 'react'
/* eslint-disable no-underscore-dangle */

export const isCompositeComponent = type => typeof type === 'function'
export const isReloadableComponent = type =>
  typeof type === 'function' || typeof type === 'object'

export const getComponentDisplayName = type => {
  const displayName = type.displayName || type.name
  return displayName && displayName !== 'ReactComponent'
    ? displayName
    : 'Component'
}

export const reactLifeCycleMountMethods = [
  'componentWillMount',
  'componentDidMount',
]

export function isReactClass(Component) {
  return !!(
    Component.prototype &&
    (React.Component.prototype.isPrototypeOf(Component.prototype) ||
      // react 14 support
      Component.prototype.isReactComponent ||
      Component.prototype.componentWillMount ||
      Component.prototype.componentWillUnmount ||
      Component.prototype.componentDidMount ||
      Component.prototype.componentDidUnmount ||
      Component.prototype.render)
  )
}

export function isReactClassInstance(Component) {
  return (
    Component && isReactClass({ prototype: Object.getPrototypeOf(Component) })
  )
}

export const getInternalInstance = instance =>
  instance._reactInternalFiber || // React 16
  instance._reactInternalInstance || // React 15
  null

export const updateInstance = instance => {
  const { updater, forceUpdate } = instance
  if (typeof forceUpdate === 'function') {
    instance.forceUpdate()
  } else if (updater && typeof updater.enqueueForceUpdate === 'function') {
    updater.enqueueForceUpdate(instance)
  }
}

export const isFragmentNode = ({ type }) =>
  React.Fragment && type === React.Fragment

const ContextType = React.createContext ? React.createContext() : null
const ConsumerType = ContextType && ContextType.Consumer.$$typeof
const ProviderType = ContextType && ContextType.Provider.$$typeof
const MemoType = React.memo && React.memo(() => null).$$typeof
const LazyType = React.lazy && React.lazy(() => null).$$typeof
const ForwardType = React.forwardRef && React.forwardRef(() => null).$$typeof

export const CONTEXT_CURRENT_VALUE = '_currentValue'

export const isContextConsumer = ({ type }) =>
  type &&
  typeof type === 'object' &&
  type.$$typeof === ConsumerType &&
  ConsumerType
export const isContextProvider = ({ type }) =>
  type &&
  typeof type === 'object' &&
  type.$$typeof === ProviderType &&
  ProviderType
export const isMemoType = ({ type }) =>
  type && typeof type === 'object' && type.$$typeof === MemoType && MemoType
export const isLazyType = ({ type }) =>
  type && typeof type === 'object' && type.$$typeof === LazyType && LazyType
export const isForwardType = ({ type }) =>
  type &&
  typeof type === 'object' &&
  type.$$typeof === ForwardType &&
  ForwardType

export const getContextProvider = type => type && type._context
