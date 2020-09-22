/* eslint-disable no-underscore-dangle */
import React from 'react';
import configuration from '../configuration';
import { enterHotUpdate } from '../global/generation';
import AppContainer from '../AppContainer.dev';
import { resolveType } from './resolver';

const lazyConstructor = '_ctor';

const getLazyConstructor = target => {
  // React 16
  if (target[lazyConstructor]) {
    return target[lazyConstructor];
  }

  // React 17
  if (target._payload) {
    return target._payload._result;
  }
  return null;
};

const setLazyConstructor = (target, replacement) => {
  replacement.isPatchedByReactHotLoader = true;

  // React 16
  if (target[lazyConstructor]) {
    target[lazyConstructor] = replacement;
  }
  // React 17
  else if (target._payload) {
    target._payload._hotUpdated = true;
    target._payload._result = replacement;
  } else {
    console.error('could not update lazy component');
  }
};

const patched = fn => {
  fn.isPatchedByReactHotLoader = true;
  return fn;
};

const patchLazyConstructor = target => {
  if (configuration.wrapLazy && !getLazyConstructor(target).isPatchedByReactHotLoader) {
    const ctor = getLazyConstructor(target);
    setLazyConstructor(target, () =>
      ctor().then(m => {
        const C = resolveType(m.default);
        // chunks has been updated - new hot loader process is taking a place
        enterHotUpdate();
        if (!React.forwardRef) {
          return {
            default: patched(props => (
              <AppContainer>
                <C {...props} />
              </AppContainer>
            )),
          };
        }
        return {
          default: patched(
            // eslint-disable-next-line prefer-arrow-callback
            React.forwardRef(function HotLoaderLazyWrapper(props, ref) {
              return (
                <AppContainer>
                  <C {...props} ref={ref} />
                </AppContainer>
              );
            }),
          ),
        };
      }),
    );
  }
};

export const updateLazy = (target, type) => {
  const ctor = getLazyConstructor(type);
  if (getLazyConstructor(target) !== ctor) {
    // just execute `import` and RHL.register will do the job
    ctor();
  }
  patchLazyConstructor(target);
  patchLazyConstructor(type);
};

export const updateMemo = (target, { type }) => {
  target.type = resolveType(type);
};

export const updateForward = (target, { render }) => {
  target.render = render;
};

export const updateContext = () => {
  // nil
};
