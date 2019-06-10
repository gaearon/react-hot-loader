/* eslint-disable no-use-before-define */
import {
  isCompositeComponent,
  getComponentDisplayName,
  isLazyType,
  isMemoType,
  isForwardType,
  isContextType,
} from './internal/reactUtils';
import { increment as incrementGeneration, getHotGeneration } from './global/generation';
import {
  updateProxyById,
  resetProxies,
  getProxyById,
  isTypeBlacklisted,
  registerComponent,
  updateFunctionProxyById,
  addSignature,
} from './reconciler/proxies';
import configuration from './configuration';
import logger from './logger';

import { preactAdapter } from './adapters/preact';
import { updateContext, updateForward, updateLazy, updateMemo } from './reconciler/fiberUpdater';
import { resolveType } from './reconciler/resolver';
import { hotComponentCompare } from './reconciler/componentComparator';

const forceSimpleSFC = { proxy: { pureSFC: true } };

const hookWrapper = hook => (cb, deps) => {
  if (configuration.reloadHooks) {
    return hook(cb, deps && deps.length > 0 ? [...deps, getHotGeneration()] : deps);
  }
  return hook(cb, deps);
};

const noDeps = () => [];

const reactHotLoader = {
  IS_REACT_MERGE_ENABLED: false,
  signature(type, key, getCustomHooks = noDeps) {
    addSignature(type, { key, getCustomHooks });
    return type;
  },
  register(type, uniqueLocalName, fileName, options = {}) {
    const id = `${fileName}#${uniqueLocalName}`;

    if (
      isCompositeComponent(type) &&
      typeof uniqueLocalName === 'string' &&
      uniqueLocalName &&
      typeof fileName === 'string' &&
      fileName
    ) {
      const proxy = getProxyById(id);

      if (proxy && proxy.getCurrent() !== type) {
        if (!reactHotLoader.IS_REACT_MERGE_ENABLED) {
          if (isTypeBlacklisted(type) || isTypeBlacklisted(proxy.getCurrent())) {
            logger.error('React-hot-loader: Cold component', uniqueLocalName, 'at', fileName, 'has been updated');
          }
        }
      }

      if (configuration.onComponentRegister) {
        configuration.onComponentRegister(type, uniqueLocalName, fileName);
      }
      if (configuration.onComponentCreate) {
        configuration.onComponentCreate(type, getComponentDisplayName(type));
      }

      registerComponent(updateProxyById(id, type, options).get(), 2);
      registerComponent(type);
      incrementGeneration();
    }
    if (isContextType({ type })) {
      // possible options - Context, Consumer, Provider.
      ['Provider', 'Consumer'].forEach(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(type, prop);
        if (descriptor && descriptor.value) {
          updateFunctionProxyById(`${id}:${prop}`, descriptor.value, updateContext);
        }
      });
      updateFunctionProxyById(id, type, updateContext);
      incrementGeneration();
    }
    if (isLazyType({ type })) {
      updateFunctionProxyById(id, type, updateLazy);
      incrementGeneration();
    }
    if (isForwardType({ type })) {
      reactHotLoader.register(type.render, `${uniqueLocalName}:render`, fileName, forceSimpleSFC);
      updateFunctionProxyById(id, type, updateForward);
      incrementGeneration();
    }
    if (isMemoType({ type })) {
      reactHotLoader.register(type.type, `${uniqueLocalName}:memo`, fileName, forceSimpleSFC);
      updateFunctionProxyById(id, type, updateMemo);
      incrementGeneration();
    }
  },

  reset() {
    resetProxies();
  },

  preact(instance) {
    preactAdapter(instance, resolveType);
  },

  resolveType(type) {
    return resolveType(type);
  },

  patch(React, ReactDOM) {
    /* eslint-disable no-console */
    if (ReactDOM && ReactDOM.setHotElementComparator) {
      ReactDOM.setHotElementComparator(hotComponentCompare);
      configuration.disableHotRenderer = configuration.disableHotRendererWhenInjected;

      configuration.ignoreSFC = configuration.ignoreSFCWhenInjected;

      reactHotLoader.IS_REACT_MERGE_ENABLED = true;
      configuration.showReactDomPatchNotification = false;

      if (ReactDOM.setHotTypeResolver) {
        configuration.intergratedResolver = true;
        ReactDOM.setHotTypeResolver(resolveType);
      }
    }

    if (!configuration.intergratedResolver) {
      /* eslint-enable */
      if (!React.createElement.isPatchedByReactHotLoader) {
        const originalCreateElement = React.createElement;
        // Trick React into rendering a proxy so that
        // its state is preserved when the class changes.
        // This will update the proxy if it's for a known type.
        React.createElement = (type, ...args) => originalCreateElement(resolveType(type), ...args);
        React.createElement.isPatchedByReactHotLoader = true;
      }

      if (!React.cloneElement.isPatchedByReactHotLoader) {
        const originalCloneElement = React.cloneElement;

        React.cloneElement = (element, ...args) => {
          const newType = element.type && resolveType(element.type);
          if (newType && newType !== element.type) {
            return originalCloneElement(
              {
                ...element,
                type: newType,
              },
              ...args,
            );
          }
          return originalCloneElement(element, ...args);
        };

        React.cloneElement.isPatchedByReactHotLoader = true;
      }

      if (!React.createFactory.isPatchedByReactHotLoader) {
        // Patch React.createFactory to use patched createElement
        // because the original implementation uses the internal,
        // unpatched ReactElement.createElement
        React.createFactory = type => {
          const factory = React.createElement.bind(null, type);
          factory.type = type;
          return factory;
        };
        React.createFactory.isPatchedByReactHotLoader = true;
      }

      if (!React.Children.only.isPatchedByReactHotLoader) {
        const originalChildrenOnly = React.Children.only;
        // Use the same trick as React.createElement
        React.Children.only = children => originalChildrenOnly({ ...children, type: resolveType(children.type) });
        React.Children.only.isPatchedByReactHotLoader = true;
      }
    }

    if (React.useEffect && !React.useState.isPatchedByReactHotLoader) {
      React.useEffect = hookWrapper(React.useEffect);
      React.useLayoutEffect = hookWrapper(React.useLayoutEffect);
      React.useCallback = hookWrapper(React.useCallback);
      React.useMemo = hookWrapper(React.useMemo);
    }

    // reactHotLoader.reset()
  },
};

export default reactHotLoader;
