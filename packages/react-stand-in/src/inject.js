import {
  isNativeFunction,
  reactLifeCycleMountMethods,
  safeReactConstructor,
  getOwnKeys,
  shallowStringsEqual,
  deepPrototypeUpdate,
} from './utils'
import { REGENERATE_METHOD, PREFIX, GENERATION } from './constants'
import config from './config'

function mergeComponents(
  ProxyComponent,
  NextComponent,
  InitialComponent,
  lastInstance,
) {
  const injectedCode = {}
  try {
    const nextInstance = safeReactConstructor(NextComponent, lastInstance)

    try {
      // Bypass babel class inheritance checking
      deepPrototypeUpdate(InitialComponent, NextComponent)
    } catch (e) {
      // It was ES6 class
    }

    const proxyInstance = safeReactConstructor(ProxyComponent, lastInstance)

    if (!nextInstance || !proxyInstance) {
      return injectedCode
    }

    const mergedAttrs = { ...proxyInstance, ...nextInstance }
    const hasRegenerate = proxyInstance[REGENERATE_METHOD]
    const ownKeys = getOwnKeys(Object.getPrototypeOf(ProxyComponent.prototype))
    Object.keys(mergedAttrs).forEach(key => {
      if (key.startsWith(PREFIX)) return
      const nextAttr = nextInstance[key]
      const prevAttr = proxyInstance[key]
      if (prevAttr && nextAttr) {
        if (isNativeFunction(nextAttr) || isNativeFunction(prevAttr)) {
          // this is bound method
          const isSameArity = nextAttr.length === prevAttr.length
          const existsInPrototype =
            ownKeys.indexOf(key) >= 0 || ProxyComponent.prototype[key]
          if (isSameArity && existsInPrototype) {
            if (hasRegenerate) {
              injectedCode[
                key
              ] = `Object.getPrototypeOf(this)['${key}'].bind(this)`
            } else {
              config.logger.warn(
                'React-stand-in:,',
                'Non-controlled class',
                ProxyComponent.name,
                'contains a new native or bound function ',
                key,
                nextAttr,
                '. Unable to reproduce',
              )
            }
          } else {
            config.logger.warn(
              'React-stand-in:',
              'Updated class ',
              ProxyComponent.name,
              'contains native or bound function ',
              key,
              nextAttr,
              '. Unable to reproduce, use arrow functions instead.',
              `(arity: ${nextAttr.length}/${prevAttr.length}, proto: ${
                existsInPrototype ? 'yes' : 'no'
              }`,
            )
          }
          return
        }

        const nextString = String(nextAttr)
        if (nextString !== String(prevAttr)) {
          if (!hasRegenerate) {
            if (
              nextString.indexOf('function') < 0 &&
              nextString.indexOf('=>') < 0
            ) {
              // just copy prop over
              injectedCode[key] = nextAttr
            } else {
              config.logger.warn(
                'React-stand-in:',
                ' Updated class ',
                ProxyComponent.name,
                'had different code for',
                key,
                nextAttr,
                '. Unable to reproduce. Regeneration support needed.',
              )
            }
          } else {
            injectedCode[key] = nextAttr
          }
        }
      }
    })
  } catch (e) {
    config.logger.warn('React-stand-in:', e)
  }
  return injectedCode
}

function checkLifeCycleMethods(ProxyComponent, NextComponent) {
  try {
    const p1 = Object.getPrototypeOf(ProxyComponent.prototype)
    const p2 = NextComponent.prototype
    reactLifeCycleMountMethods.forEach(key => {
      const d1 = Object.getOwnPropertyDescriptor(p1, key) || { value: p1[key] }
      const d2 = Object.getOwnPropertyDescriptor(p2, key) || { value: p2[key] }
      if (!shallowStringsEqual(d1, d2)) {
        config.logger.warn(
          'React-stand-in:',
          'You did update',
          ProxyComponent.name,
          's lifecycle method',
          key,
          '. Unable to repeat',
        )
      }
    })
  } catch (e) {
    // Ignore errors
  }
}

function inject(target, currentGeneration, injectedMembers) {
  if (target[GENERATION] !== currentGeneration) {
    const hasRegenerate = !!target[REGENERATE_METHOD]
    Object.keys(injectedMembers).forEach(key => {
      try {
        if (hasRegenerate) {
          target[REGENERATE_METHOD](
            key,
            `(function REACT_HOT_LOADER_SANDBOX () {
          var _this2 = this; // common babel variable
          return ${injectedMembers[key]};
          }).call(this)`,
          )
        } else {
          target[key] = injectedMembers[key]
        }
      } catch (e) {
        config.logger.warn(
          'React-stand-in: Failed to regenerate method ',
          key,
          ' of class ',
          target,
        )
        config.logger.warn('got error', e)
      }
    })

    target[GENERATION] = currentGeneration
  }
}

export { mergeComponents, checkLifeCycleMethods, inject }
