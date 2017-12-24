import { isNativeFunction, reactLifeCycleMethods } from './react-utils'
import { REGENERATE_METHOD, PREFIX, GENERATION } from './symbols'

function safeConstructor(Component, lastInstance){
  try {
    if(lastInstance) {
      return new Component(lastInstance.props, lastInstance.context)
    }
    return new Component({}, {})
  } catch (e) {
    // some components, like Redux connect could not be created without proper context
  }
  return null;
}

function mergeComponents(ProxyComponent, NextComponent, InitialComponent, lastInstance) {
  const injectedCode = {}
  try {
    const nextInstance = safeConstructor(NextComponent, lastInstance);

    try {
      // bypass babel class inheritance checking
      InitialComponent.prototype = NextComponent.prototype
    } catch (e) {
      // It was es6 class
    }

    const proxyInstance = safeConstructor(ProxyComponent, lastInstance);

    if(!nextInstance || !proxyInstance){
      return injectedCode;
    }

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
            injectedCode[key] = `Object.getPrototypeOf(this)['${
              key
            }'].bind(this)`
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
          return;
        }

        const nextString = String(nextAttr);
        if (nextString !== String(prevAttr)) {
          if (!hasRegenerate) {
            if (nextString.indexOf('function') < 0 && nextString.indexOf('=>') < 0) {
              // just copy prop over
              injectedCode[key] = nextAttr;
            } else {
              console.error(
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
    const hasRegenerate = !!target[REGENERATE_METHOD]
    Object.keys(injectedMembers).forEach(key => {
      try {
        if(hasRegenerate) {
          target[REGENERATE_METHOD](
            key,
            `(function REACT_HOT_LOADER_SANDBOX () {
          var _this2 = this; // common babel variable
          return ${injectedMembers[key]};
          }).call(this)`,
          )
        } else {
          target[key] = injectedMembers[key];
        }
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
