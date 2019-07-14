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

export function resolveType(type, options = {}) {
  // fast return
  if (!isCompositeComponent(type) || isProxyType(type)) {
    return type;
  }

  const element = { type };

  // fast meta
  if (typeof element === 'object') {
    if (isLazyType(element) || isMemoType(element) || isForwardType(element) || isContextType(element)) {
      return getProxyByType(type) || type;
    }
  }

  const existingProxy = getProxyByType(type);

  // cold API
  if (shouldNotPatchComponent(type)) {
    return existingProxy ? existingProxy.getCurrent() : type;
  }

  if (!existingProxy && configuration.onComponentCreate) {
    configuration.onComponentCreate(type, getComponentDisplayName(type));
    if (shouldNotPatchComponent(type)) return type;
  }

  const proxy = internalConfiguration.disableProxyCreation ? existingProxy : createProxyForType(type, options);

  return proxy ? proxy.get() : type;
}
