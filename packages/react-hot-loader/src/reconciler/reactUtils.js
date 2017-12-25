/* eslint-disable no-underscore-dangle */

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
