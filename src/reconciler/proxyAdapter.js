import React from 'react'
import {
  enterHotUpdate,
  get as getGeneration,
  setComparisonHooks,
} from '../global/generation'
import { getProxyByType, setStandInOptions } from './proxies'
import reconcileHotReplacement, {
  flushScheduledUpdates,
  unscheduleUpdate,
} from './index'
import configuration, { internalConfiguration } from '../configuration'
import { forEachKnownClass } from '../proxy/createClassProxy'
import { EmptyErrorPlaceholder, logException } from '../errorReporter'

export const RENDERED_GENERATION = 'REACT_HOT_LOADER_RENDERED_GENERATION'

export const renderReconciler = (target, force) => {
  // we are not inside parent reconcilation
  const currentGeneration = getGeneration()
  const componentGeneration = target[RENDERED_GENERATION]

  target[RENDERED_GENERATION] = currentGeneration

  if (!internalConfiguration.disableProxyCreation) {
    if (
      (componentGeneration || force) &&
      componentGeneration !== currentGeneration
    ) {
      enterHotUpdate()
      reconcileHotReplacement(target)
      return true
    }
  }
  return false
}

function asyncReconciledRender(target) {
  renderReconciler(target, false)
}

export function proxyWrapper(element) {
  // post wrap on post render
  if (!internalConfiguration.disableProxyCreation) {
    unscheduleUpdate(this)
  }

  if (!element) {
    return element
  }
  if (Array.isArray(element)) {
    return element.map(proxyWrapper)
  }
  if (typeof element.type === 'function') {
    const proxy = getProxyByType(element.type)
    if (proxy) {
      return {
        ...element,
        type: proxy.get(),
      }
    }
  }
  return element
}

const ERROR_STATE = 'react-hot-loader-catched-error'
const OLD_RENDER = 'react-hot-loader-original-render'

function componentDidCatch(error, errorInfo) {
  this[ERROR_STATE] = {
    error,
    errorInfo,
    generation: getGeneration(),
  }
  Object.getPrototypeOf(this)[ERROR_STATE] = this[ERROR_STATE]
  if (!configuration.errorReporter) {
    logException({
      error,
      errorInfo,
    })
  }
  this.forceUpdate()
}

function componentRender() {
  const { error, errorInfo, generation } = this[ERROR_STATE] || {}

  if (error && generation === getGeneration()) {
    return React.createElement(
      configuration.errorReporter || EmptyErrorPlaceholder,
      { error, errorInfo, component: this },
    )
  }
  try {
    return this[OLD_RENDER].render.call(this)
  } catch (renderError) {
    this[ERROR_STATE] = {
      error: renderError,
      generation: getGeneration(),
    }
    if (!configuration.errorReporter) {
      logException(renderError, undefined, this)
    }
    return componentRender.call(this)
  }
}

setComparisonHooks(
  () => ({}),
  ({ prototype }) => {
    if (!prototype[OLD_RENDER]) {
      const renderDescriptior = Object.getOwnPropertyDescriptor(
        prototype,
        'render',
      )
      prototype[OLD_RENDER] = {
        descriptor: renderDescriptior ? renderDescriptior.value : undefined,
        render: prototype.render,
      }
      prototype.componentDidCatch = componentDidCatch

      prototype.render = componentRender
    }
  },
  () =>
    forEachKnownClass(({ prototype }) => {
      if (prototype[OLD_RENDER]) {
        const { generation } = prototype[ERROR_STATE] || {}

        if (generation === getGeneration()) {
          // still in error.
          // keep render hooked
        } else {
          delete prototype.componentDidCatch
          if (!prototype[OLD_RENDER].descriptor) {
            delete prototype.render
          } else {
            prototype.render = prototype[OLD_RENDER].descriptor
          }
          delete prototype[OLD_RENDER]
        }
      }
    }),
)

setStandInOptions({
  componentWillRender: asyncReconciledRender,
  componentDidRender: proxyWrapper,
  componentDidUpdate: flushScheduledUpdates,
})
