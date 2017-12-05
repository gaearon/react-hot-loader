import global from 'global'
import React from 'react'
import { didUpdate } from './updateCounter'
import {
  isTypeUsed, isTypeRegistered, updateProxyById,
  resetProxies, getProxyByType
} from "./reconciler/proxies";

const hooks = {
  register(type, uniqueLocalName, fileName) {
    didUpdate()

    if (typeof type !== 'function') {
      return
    }
    if (!uniqueLocalName || !fileName) {
      return
    }
    if (typeof uniqueLocalName !== 'string' || typeof fileName !== 'string') {
      return
    }
    const id = fileName + '#' + uniqueLocalName // eslint-disable-line prefer-template
    if (!isTypeRegistered(type) && isTypeUsed(type)) {
      // nop
      return
    }

    updateProxyById(id, type);
  },

  reset(useWeakMap) {
    resetProxies(useWeakMap);
  },

  warnings: true,
}

hooks.reset(typeof WeakMap === 'function')

// function warnAboutUnacceptedClass(typeSignature) {
//   if (didUpdateProxy() && global.__REACT_HOT_LOADER__.warnings !== false) {
//     console.warn(
//       'React Hot Loader: this component is not accepted by Hot Loader. \n' +
//         'Please check is it extracted as a top level class, a function or a variable. \n' +
//         'Click below to reveal the source location: \n',
//       typeSignature,
//     )
//   }
// }
//
// function getSignature(type) {
//   return type.toString() + (type.displayName ? type.displayName : '')
// }

function resolveType(type) {
  // We only care about composite components
  if (typeof type !== 'function') {
    return type
  }

//  const wasKnownBefore = willCreateElement(type);

  // When available, give proxy class to React instead of the real class.
//  const id = getIdByType(type);
//  if (!id) {
    // if (!wasKnownBefore) {
    //   const signature = getSignature(type)
    //   if (knownSignatures[signature]) {
    //     warnAboutUnacceptedClass(type)
    //   } else {
    //     knownSignatures[signature] = type
    //   }
    // }
//    return type
//  }

  const proxy = getProxyByType(type);
  if (!proxy) {
    return type
  }

  return proxy.get()
}


const { createElement: originalCreateElement } = React

function patchedCreateElement(type, ...args) {
  // Trick React into rendering a proxy so that
  // its state is preserved when the class changes.
  // This will update the proxy if it's for a known type.
  const resolvedType = resolveType(type)
  return originalCreateElement(resolvedType, ...args)
}
patchedCreateElement.isPatchedByReactHotLoader = true

function patchedCreateFactory(type) {
  // Patch React.createFactory to use patched createElement
  // because the original implementation uses the internal,
  // unpatched ReactElement.createElement
  const factory = patchedCreateElement.bind(null, type)
  factory.type = type
  return factory
}
patchedCreateFactory.isPatchedByReactHotLoader = true

if (typeof global.__REACT_HOT_LOADER__ === 'undefined') {
  React.createElement = patchedCreateElement
  React.createFactory = patchedCreateFactory
  global.__REACT_HOT_LOADER__ = hooks
}
