import { isNativeFunction, reactLifeCycleMethods } from './react-utils'
import { REGENERATE_METHOD, PREFIX, GENERATION } from './symbols'

function mergeComponents(ProxyComponent, NextComponent, InitialComponent) {
  const injectedCode = {}
  try {
    const nextInstance = new NextComponent({}, {})

    try {
      // bypass babel class inheritance checking
      InitialComponent.prototype = NextComponent.prototype
    } catch (e) {
      // It was es6 class
    }

    const proxyInstance = new ProxyComponent({}, {})

    const mergedAttrs = Object.assign({}, proxyInstance, nextInstance)
    const hasRegenerate = proxyInstance[REGENERATE_METHOD]
    Object.keys(mergedAttrs).forEach(key => {
      if (key.startsWith(PREFIX)) return
      const nextAttr = nextInstance[key]
      const prevAttr = proxyInstance[key]
      if (prevAttr && nextAttr) {
        if (isNativeFunction(nextAttr) || isNativeFunction(prevAttr)) {
          // this is bound method
          if (
            nextAttr.length === prevAttr.length &&
            ProxyComponent.prototype[key]
          ) {
            injectedCode[
              key
            ] = `Object.getPrototypeOf(this)['${key}'].bind(this)`
          } else {
            console.error(
              'React-stand-in:',
              'Updated class ',
              ProxyComponent.name,
              'contains native or bound function ',
              key,
              nextAttr,
              '. Unable to reproduce, use arrow functions instead.',
            )
          }
          return
        }

        if (String(nextAttr) !== String(prevAttr)) {
          if (!hasRegenerate) {
            console.error(
              'React-stand-in:',
              ' Updated class ',
              ProxyComponent.name,
              'had different code for',
              key,
              nextAttr,
              '. Unable to reproduce. Regeneration support needed.',
            )
          } else {
            injectedCode[key] = nextAttr
          }
        }
      }
    })
  } catch (e) {
    console.error('React-stand-in:', e)
  }
  return injectedCode
}

function checkLifeCycleMethods(ProxyComponent, NextComponent) {
  try {
    const p1 = ProxyComponent.prototype
    const p2 = NextComponent.prototype
    reactLifeCycleMethods.forEach(key => {
      if (String(p1[key]) !== String(p2[key])) {
        console.error(
          'React-stand-in:',
          'You did update',
          ProxyComponent.name,
          's lifecycle method',
          p2[key],
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
    Object.keys(injectedMembers).forEach(key => {
      try {
        target[REGENERATE_METHOD](
          key,
          `(function REACT_HOT_LOADER_SANDBOX () {
          var _this2 = this; // common babel variable
          return ${injectedMembers[key]};
          }).call(this)`,
        )
      } catch (e) {
        console.error(
          'React-stand-in: Failed to regenerate method ',
          key,
          ' of class ',
          target,
        )
        console.error('got error', e)
      }
    })

    target[GENERATION] = currentGeneration
  }
}

export { mergeComponents, checkLifeCycleMethods, inject }
