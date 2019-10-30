import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import hoistNonReactStatic from 'hoist-non-react-statics';

import { getComponentDisplayName } from './internal/reactUtils';
import configuration from './configuration';
import AppContainer from './AppContainer.dev';
import reactHotLoader from './reactHotLoader';
import { isOpened as isModuleOpened, hotModule, getLastModuleOpened } from './global/modules';
import logger from './logger';
import { clearExceptions, logException } from './errorReporter';
import { createQueue } from './utils/runQueue';
import { enterHotUpdate, getHotGeneration } from './global/generation';

/* eslint-disable camelcase, no-undef */
const requireIndirect = typeof __webpack_require__ !== 'undefined' ? __webpack_require__ : require;
/* eslint-enable */

const chargeFailbackTimer = id =>
  setTimeout(() => {
    const error = `hot update failed for module "${id}". Last file processed: "${getLastModuleOpened()}".`;
    logger.error(error);
    logException({
      toString: () => error,
    });
    // 100 ms more "code" tolerant that 0, and would catch error in any case
  }, 100);

const clearFailbackTimer = timerId => clearTimeout(timerId);

const createHoc = (SourceComponent, TargetComponent) => {
  hoistNonReactStatic(TargetComponent, SourceComponent);
  TargetComponent.displayName = `HotExported${getComponentDisplayName(SourceComponent)}`;
  return TargetComponent;
};

const runInRequireQueue = createQueue();
const runInRenderQueue = createQueue(cb => {
  if (ReactDOM.unstable_batchedUpdates) {
    ReactDOM.unstable_batchedUpdates(cb);
  } else {
    cb();
  }
});

const makeHotExport = (sourceModule, moduleId) => {
  const updateInstances = possibleError => {
    if (possibleError && possibleError instanceof Error) {
      console.error(possibleError);
      return;
    }
    const module = hotModule(moduleId);

    const deepUpdate = () => {
      // force flush all updates
      runInRenderQueue(() => {
        enterHotUpdate();
        const gen = getHotGeneration();
        module.instances.forEach(inst => inst.forceUpdate());

        if (configuration.trackTailUpdates) {
          let runLimit = 0;
          const checkTailUpdates = () => {
            setTimeout(() => {
              if (getHotGeneration() !== gen) {
                // we know that some components were updated, but not tracking which ones
                // even if their updates might be incorporated automatically (like lazy)
                // we dont know which one should be tracked, and which updates are important
                if (typeof configuration.trackTailUpdates === 'boolean' && configuration.trackTailUpdates) {
                  // Disable logging because user passed 'true'... they are aware they should be tracked.
                  console.warn(
                    'React-Hot-Loader: some components were updated out-of-bound. Updating your app to reconcile the changes.',
                  );
                }
                deepUpdate();
              } else if (++runLimit < 5) {
                checkTailUpdates();
              }
            }, 16);
          };

          checkTailUpdates();
        }
      });
    };

    // require all modules
    runInRequireQueue(() => {
      try {
        // webpack will require everything by this time
        // but let's double check...
        requireIndirect(moduleId);
      } catch (e) {
        console.error('React-Hot-Loader: error detected while loading', moduleId);
        console.error(e);
      }
    }).then(deepUpdate);
  };

  if (sourceModule.hot) {
    // Mark as self-accepted for Webpack (callback is an Error Handler)
    // Update instances for Parcel (callback is an Accept Handler)
    sourceModule.hot.accept(updateInstances);

    // Webpack way
    if (sourceModule.hot.addStatusHandler) {
      if (sourceModule.hot.status() === 'idle') {
        sourceModule.hot.addStatusHandler(status => {
          if (status === 'apply') {
            clearExceptions();
            updateInstances();
          }
        });
      }
    }
  } else {
    logger.warn('React-hot-loader: Hot Module Replacement is not enabled');
  }
};

const hot = sourceModule => {
  if (!sourceModule) {
    // this is fatal
    throw new Error('React-hot-loader: `hot` was called without any argument provided');
  }
  const moduleId = sourceModule.id || sourceModule.i || sourceModule.filename;
  if (!moduleId) {
    console.error('`module` provided', sourceModule);
    throw new Error('React-hot-loader: `hot` could not find the `name` of the the `module` you have provided');
  }
  const module = hotModule(moduleId);
  makeHotExport(sourceModule, moduleId);

  clearExceptions();
  const failbackTimer = chargeFailbackTimer(moduleId);
  let firstHotRegistered = false;

  // TODO: Ensure that all exports from this file are react components.

  return (WrappedComponent, props) => {
    clearFailbackTimer(failbackTimer);
    // register proxy for wrapped component
    // only one hot per file would use this registration
    if (!firstHotRegistered) {
      firstHotRegistered = true;
      reactHotLoader.register(WrappedComponent, getComponentDisplayName(WrappedComponent), `RHL${moduleId}`);
    }

    return createHoc(
      WrappedComponent,
      class ExportedComponent extends Component {
        componentDidMount() {
          module.instances.push(this);
        }

        componentWillUnmount() {
          if (isModuleOpened(sourceModule)) {
            const componentName = getComponentDisplayName(WrappedComponent);
            logger.error(
              `React-hot-loader: Detected AppContainer unmount on module '${moduleId}' update.\n` +
                `Did you use "hot(${componentName})" and "ReactDOM.render()" in the same file?\n` +
                `"hot(${componentName})" shall only be used as export.\n` +
                `Please refer to "Getting Started" (https://github.com/gaearon/react-hot-loader/).`,
            );
          }
          module.instances = module.instances.filter(a => a !== this);
        }

        render() {
          return (
            <AppContainer {...props}>
              <WrappedComponent {...this.props} />
            </AppContainer>
          );
        }
      },
    );
  };
};

export default hot;
