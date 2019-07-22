import { createProxyForType, getProxyByType, isProxyType, isTypeBlacklisted } from './proxies';
import {
  getComponentDisplayName,
  isCompositeComponent,
  isContextType,
  isForwardType,
  isLazyType,
  isMemoType,
} from '../internal/reactUtils';
import configuration, { internalConfiguration } from '../configuration';

const shouldNotPatchComponent = type => isTypeBlacklisted(type);

export function resolveUtility(type) {
  const element = { type };

  // fast meta
  if (typeof element === 'object') {
    if (isLazyType(element) || isMemoType(element) || isForwardType(element) || isContextType(element)) {
      return getProxyByType(type) || type;
    }
  }

  return undefined;
}

export function resolveComponent(type, options = {}) {
  const existingProxy = getProxyByType(type);

  // cold API
  if (shouldNotPatchComponent(type)) {
    return existingProxy ? existingProxy.getCurrent() : type;
  }

  if (!existingProxy && configuration.onComponentCreate) {
    configuration.onComponentCreate(type, getComponentDisplayName(type));
    if (shouldNotPatchComponent(type)) {
      return type;
    }
  }

  const proxy = internalConfiguration.disableProxyCreation ? existingProxy : createProxyForType(type, options);

  return proxy ? proxy.get() : undefined;
}

export function resolveProxy(type) {
  if (isProxyType(type)) {
    return type;
  }

  return undefined;
}

export function resolveNotComponent(type) {
  if (!isCompositeComponent(type)) {
    return type;
  }

  return undefined;
}

export const resolveSimpleType = type =>
  resolveProxy(type) || resolveUtility(type) || resolveNotComponent(type) || type;

export const resolveType = (type, options = {}) =>
  resolveProxy(type) || resolveUtility(type) || resolveNotComponent(type) || resolveComponent(type, options) || type;
