import React from 'react';
import { enterHotUpdate, get as getGeneration, hotComparisonOpen, setComparisonHooks } from '../global/generation';
import { getProxyByType, setStandInOptions } from './proxies';
import reconcileHotReplacement, { flushScheduledUpdates, unscheduleUpdate } from './index';
import configuration, { internalConfiguration } from '../configuration';
import { EmptyErrorPlaceholder, logException } from '../errorReporter';
import { RENDERED_GENERATION } from '../proxy';

export const renderReconciler = (target, force) => {
  // we are not inside parent reconcilation
  const currentGeneration = getGeneration();
  const componentGeneration = target[RENDERED_GENERATION];

  target[RENDERED_GENERATION] = currentGeneration;

  if (!internalConfiguration.disableProxyCreation) {
    if ((componentGeneration || force) && componentGeneration !== currentGeneration) {
      enterHotUpdate();
      reconcileHotReplacement(target);
      return true;
    }
  }
  return false;
};

function asyncReconciledRender(target) {
  renderReconciler(target, false);
}

export function proxyWrapper(element) {
  // post wrap on post render
  if (!internalConfiguration.disableProxyCreation) {
    unscheduleUpdate(this);
  }

  if (!element) {
    return element;
  }
  if (Array.isArray(element)) {
    return element.map(proxyWrapper);
  }
  if (typeof element.type === 'function') {
    const proxy = getProxyByType(element.type);
    if (proxy) {
      return {
        ...element,
        type: proxy.get(),
      };
    }
  }
  return element;
}

const ERROR_STATE = 'react_hot_loader_catched_error';
const ERROR_STATE_PROTO = 'react_hot_loader_catched_error-prototype';
const OLD_RENDER = 'react_hot_loader_original_render';

function componentDidCatch(error, errorInfo) {
  this[ERROR_STATE] = {
    location: 'boundary',
    error,
    errorInfo,
    generation: getGeneration(),
  };
  Object.getPrototypeOf(this)[ERROR_STATE_PROTO] = this[ERROR_STATE];
  if (!configuration.errorReporter) {
    logException(error, errorInfo, this);
  }
  this.forceUpdate();
}

function componentRender(...args) {
  const { error, errorInfo, generation } = this[ERROR_STATE] || {};

  if (error && generation === getGeneration()) {
    return React.createElement(configuration.errorReporter || EmptyErrorPlaceholder, {
      error,
      errorInfo,
      component: this,
    });
  }

  if (this.hotComponentUpdate) {
    this.hotComponentUpdate();
  }
  try {
    return this[OLD_RENDER].render.call(this, ...args);
  } catch (renderError) {
    this[ERROR_STATE] = {
      location: 'render',
      error: renderError,
      generation: getGeneration(),
    };
    if (!configuration.errorReporter) {
      logException(renderError, undefined, this);
    }
    return componentRender.call(this);
  }
}

export function retryHotLoaderError() {
  delete this[ERROR_STATE];
  this.forceUpdate();
}

setComparisonHooks(
  () => ({}),
  component => {
    if (!hotComparisonOpen()) {
      return;
    }
    const { prototype } = component;
    if (!prototype[OLD_RENDER]) {
      const renderDescriptior = Object.getOwnPropertyDescriptor(prototype, 'render');
      prototype[OLD_RENDER] = {
        descriptor: renderDescriptior ? renderDescriptior.value : undefined,
        render: prototype.render,
      };
      prototype.componentDidCatch = componentDidCatch;
      prototype.retryHotLoaderError = retryHotLoaderError;

      prototype.render = componentRender;
    }
    delete prototype[ERROR_STATE];
  },
  ({ prototype }) => {
    if (prototype[OLD_RENDER]) {
      const { generation } = prototype[ERROR_STATE_PROTO] || {};

      if (generation === getGeneration()) {
        // still in error.
        // keep render hooked
      } else {
        delete prototype.componentDidCatch;
        delete prototype.retryHotLoaderError;
        if (!prototype[OLD_RENDER].descriptor) {
          delete prototype.render;
        } else {
          prototype.render = prototype[OLD_RENDER].descriptor;
        }
        delete prototype[ERROR_STATE_PROTO];
        delete prototype[OLD_RENDER];
      }
    }
  },
);

setStandInOptions({
  componentWillRender: asyncReconciledRender,
  componentDidRender: proxyWrapper,
  componentDidUpdate: component => {
    component[RENDERED_GENERATION] = getGeneration();
    flushScheduledUpdates();
  },
});
