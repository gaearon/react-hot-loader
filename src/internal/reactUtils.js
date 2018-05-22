import React from 'react'
/* eslint-disable no-underscore-dangle */

export const isCompositeComponent = type => typeof type === 'function'

export const getComponentDisplayName = type =>
  type.displayName || type.name || 'Component'

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

export const CONTEXT_CURRENT_VALUE = '_currentValue'

export const isContextConsumer = ({ type }) =>
  type && typeof type === 'object' && type.$$typeof === ConsumerType
export const isContextProvider = ({ type }) =>
  type && typeof type === 'object' && type.$$typeof === ProviderType
export const getContextProvider = type => type && type._context
