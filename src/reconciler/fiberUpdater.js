import React from 'react';

import { enterHotUpdate } from '../global/generation';
import AppContainer from '../AppContainer.dev';
import { resolveType } from './resolver';

const lazyConstructor = '_ctor';

export const updateLazy = (target, type) => {
  const ctor = type[lazyConstructor];
  if (target[lazyConstructor] !== type[lazyConstructor]) {
    // just execute `import` and RHL.register will do the job
    ctor();
  }
  if (!target[lazyConstructor].isPatchedByReactHotLoader) {
    target[lazyConstructor] = () =>
      ctor().then(m => {
        const C = resolveType(m.default);
        // chunks has been updated - new hot loader process is taking a place
        enterHotUpdate();
        if (!React.forwardRef) {
          return {
            default: props => (
              <AppContainer>
                <C {...props} />
              </AppContainer>
            ),
          };
        }
        return {
          default: React.forwardRef((props, ref) => (
            <AppContainer>
              <C {...props} ref={ref} />
            </AppContainer>
          )),
        };
      });
    target[lazyConstructor].isPatchedByReactHotLoader = true;
  }
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
