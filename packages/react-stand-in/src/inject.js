import { isNativeFunction, reactLifeCycleMethods } from './react-utils'
import { REGENERATE_METHOD, PREFIX, GENERATION } from './symbols'
import { reportError } from './config'

function safeConstructor(Component, lastInstance) {
  try {
    if (lastInstance) {
      return new Component(lastInstance.props, lastInstance.context)
    }
    return new Component({}, {})
  } catch (e) {
    // some components, like Redux connect could not be created without proper context
  }
  return null
}

function mergeComponents(
  ProxyComponent,
  NextComponent,
  InitialComponent,
  lastInstance,
) {
  const injectedCode = {}
  try {
    const nextInstance = safeConstructor(NextComponent, lastInstance)

    try {
      // bypass babel class inheritance checking
      InitialComponent.prototype = NextComponent.prototype
    } catch (e) {
      // It was es6 class
    }

    const proxyInstance = safeConstructor(ProxyComponent, lastInstance)

    if (!nextInstance || !proxyInstance) {
      return injectedCode
    }

    const mergedAttrs = Object.assign({}, proxyInstance, nextInstance)
    const hasRegenerate = proxyInstance[REGENERATE_METHOD]
    const ownKeys = Reflect.ownKeys(
      Object.getPrototypeOf(ProxyComponent.prototype),
    )
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
              reportError(
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
            reportError(
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
              reportError(
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
    reportError('React-stand-in:', e)
  }
  return injectedCode
}

function areDescriptorEqual(a, b) {
  for (const key in a) {
    if (String(a[key]) !== String(b[key])) {
      return false
    }
  }
  return true
}

function checkLifeCycleMethods(ProxyComponent, NextComponent) {
  try {
    const p1 = Object.getPrototypeOf(ProxyComponent.prototype)
    const p2 = NextComponent.prototype
    reactLifeCycleMethods.forEach(key => {
      const d1 = Object.getOwnPropertyDescriptor(p1, key) || { value: p1[key] }
      const d2 = Object.getOwnPropertyDescriptor(p2, key) || { value: p2[key] }
      if (!areDescriptorEqual(d1, d2)) {
        reportError(
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
        reportError(
          'React-stand-in: Failed to regenerate method ',
          key,
          ' of class ',
          target,
        )
        reportError('got error', e)
      }
    })

    target[GENERATION] = currentGeneration
  }
}

export { mergeComponents, checkLifeCycleMethods, inject }
