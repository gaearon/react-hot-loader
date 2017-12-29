/* eslint-disable no-underscore-dangle */

export const isCompositeComponent = type => typeof type === 'function'

export const getComponentDisplayName = type =>
  type.displayName || type.name || 'Component'

export const getReactInstance = instance =>
  instance._reactInternalFiber ||
  instance._reactInternalInstance ||
  instance._instance

export const getReactComponent = instance =>
  typeof instance.type === 'function' && instance.stateNode

export const updateInstance = instance => {
  const { updater, forceUpdate } = instance
  if (typeof forceUpdate === 'function') {
    instance.forceUpdate()
  } else if (updater && typeof updater.enqueueForceUpdate === 'function') {
    updater.enqueueForceUpdate(instance)
  }
}
