import { getIdByType, getProxyByType, getSignature, isColdType, updateProxyById } from './proxies';
import { hotComparisonOpen } from '../global/generation';
import {
  getElementType,
  isContextType,
  isForwardType,
  isLazyType,
  isMemoType,
  isReactClass,
  isReloadableComponent,
} from '../internal/reactUtils';
import { areSwappable } from './utils';
import { PROXY_KEY, UNWRAP_PROXY } from '../proxy';
import { resolveType } from './resolver';
import logger from '../logger';
import configuration from '../configuration';

const getInnerComponentType = component => {
  const unwrapper = component[UNWRAP_PROXY];
  return unwrapper ? unwrapper() : component;
};

function haveEqualSignatures(prevType, nextType) {
  try {
    const prevSignature = getSignature(prevType);
    const nextSignature = getSignature(nextType);

    if (prevSignature === undefined && nextSignature === undefined) {
      return true;
    }
    if (prevSignature === undefined || nextSignature === undefined) {
      return false;
    }
    if (prevSignature.key !== nextSignature.key) {
      return false;
    }

    // TODO: we might need to calculate previous signature earlier in practice,
    // such as during the first time a component is resolved. We'll revisit this.
    const prevCustomHooks = prevSignature.getCustomHooks();
    const nextCustomHooks = nextSignature.getCustomHooks();
    if (prevCustomHooks.length !== nextCustomHooks.length) {
      return false;
    }

    for (let i = 0; i < nextCustomHooks.length; i++) {
      if (!haveEqualSignatures(prevCustomHooks[i], nextCustomHooks[i])) {
        return false;
      }
    }
  } catch (e) {
    logger.error('React-Hot-Loader: error occurred while comparing hook signature', e);
    return false;
  }

  return true;
}

const areSignaturesCompatible = (a, b) => {
  // compare signatures of two components
  // non-equal component have to remount and there is two options to do it
  // - fail the comparison, remounting all tree below
  // - fulfill it, but set `_debugNeedsRemount` on a fiber to drop only local state
  // the second way is not published yet, so going with the first one
  if (!haveEqualSignatures(a, b)) {
    logger.warn('⚛️🔥🎣 Hook order change detected: component', a, 'has been remounted');
    return false;
  }
  return true;
};

const compareRegistered = (a, b) =>
  getIdByType(a) === getIdByType(b) && getProxyByType(a) === getProxyByType(b) && areSignaturesCompatible(a, b);

const areDeepSwappable = (oldType, newType) => {
  const type = { type: oldType };

  if (typeof oldType === 'function') {
    return areSwappable(oldType, newType);
  }

  if (isForwardType(type)) {
    return areDeepSwappable(oldType.render, newType.render);
  }

  if (isMemoType(type)) {
    return areDeepSwappable(oldType.type, newType.type);
  }

  // that's not safe
  // if (isLazyType(type)) {
  //   return areDeepSwappable(oldType._ctor, newType._ctor)
  // }

  return false;
};

const compareComponents = (oldType, newType, setNewType, baseType) => {
  let defaultResult = oldType === newType;

  if (
    (oldType && !newType) ||
    (!oldType && newType) ||
    typeof oldType !== typeof newType ||
    getElementType(oldType) !== getElementType(newType) ||
    0
  ) {
    return defaultResult;
  }

  if (getIdByType(newType) || getIdByType(oldType)) {
    if (!compareRegistered(oldType, newType)) {
      return false;
    }
    defaultResult = true;
  }

  if (isForwardType({ type: oldType }) && isForwardType({ type: newType })) {
    if (!compareRegistered(oldType.render, newType.render)) {
      return false;
    }
    if (oldType.render === newType.render || areDeepSwappable(oldType, newType)) {
      setNewType(newType);
      return true;
    }
    return defaultResult;
  }

  if (isMemoType({ type: oldType }) && isMemoType({ type: newType })) {
    if (!compareRegistered(oldType.type, newType.type)) {
      return false;
    }
    if (oldType.type === newType.type || areDeepSwappable(oldType, newType)) {
      if (baseType) {
        // memo form different fibers, why?
        if (baseType.$$typeof === newType.$$typeof) {
          setNewType(newType);
        } else {
          setNewType(newType.type);
        }
      } else {
        logger.warn('Please update hot-loader/react-dom');
        if (isReactClass(newType.type)) {
          setNewType(newType);
        } else {
          setNewType(newType.type);
        }
      }

      return true;
    }
    return defaultResult;
  }

  if (isLazyType({ type: oldType })) {
    // no need to update
    // setNewType(newType);
    return defaultResult;
  }

  if (isContextType({ type: oldType })) {
    // update provider
    setNewType(newType);
    return defaultResult;
  }

  if (
    typeof newType === 'function' &&
    (defaultResult ||
      (newType !== oldType && areSignaturesCompatible(newType, oldType) && areSwappable(newType, oldType)))
  ) {
    const unwrapFactory = newType[UNWRAP_PROXY];
    const oldProxy = unwrapFactory && getProxyByType(unwrapFactory());
    if (oldProxy) {
      oldProxy.dereference();
      updateProxyById(oldType[PROXY_KEY] || getIdByType(oldType), getInnerComponentType(newType));
    } else {
      setNewType(newType);
    }
    return true;
  }

  return defaultResult;
};

const knownPairs = new WeakMap();
const emptyMap = new WeakMap();

const getKnownPair = (oldType, newType) => {
  const pair = knownPairs.get(oldType) || emptyMap;
  return pair.get(newType);
};

export const hotComponentCompare = (oldType, preNewType, setNewType, baseType) => {
  const hotActive = hotComparisonOpen();
  const newType = configuration.integratedResolver ? resolveType(preNewType) : preNewType;

  // TODO: find out the root cause
  // we could not use "fast result" here - go a full part to update a fiber.
  // const knownType = getKnownPair(oldType, newType);
  // if (knownType !== undefined) {
  //   return knownType;
  // }

  let result = oldType === newType;

  if (hotActive) {
    // pre fail components which could not be merged
    if (
      !isReloadableComponent(oldType) ||
      !isReloadableComponent(newType) ||
      isColdType(oldType) ||
      isColdType(oldType) ||
      !oldType ||
      !newType ||
      0
    ) {
      return result;
    }

    result = compareComponents(oldType, newType, setNewType, baseType);
    const pair = knownPairs.get(oldType) || new WeakMap();
    pair.set(newType, result);
    knownPairs.set(oldType, pair);
    return result;
  }

  // result - true if components are equal, or were "equal" at any point in the past
  return result || getKnownPair(oldType, newType) || false;
};
