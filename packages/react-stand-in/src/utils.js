import config from './config'

export function getDisplayName(Component) {
  const displayName = Component.displayName || Component.name
  return displayName && displayName !== 'ReactComponent'
    ? displayName
    : 'Unknown'
}

export const reactLifeCycleMountMethods = [
  'componentWillMount',
  'componentDidMount',
]

export function isReactClass(Component) {
  return (
    Component.prototype &&
    (Component.prototype.isReactComponent ||
      Component.prototype.componentWillMount ||
      Component.prototype.componentWillUnmount ||
      Component.prototype.componentDidMount ||
      Component.prototype.componentDidUnmount ||
      Component.prototype.render)
  )
}

export function safeReactConstructor(Component, lastInstance) {
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

export function isNativeFunction(fn) {
  return typeof fn === 'function'
    ? fn.toString().indexOf('[native code]') > 0
    : false
}

export const identity = a => a

export const doesSupportClasses = (function() {
  try {
    eval('class Test {}')
    return true
  } catch (e) {
    return false
  }
})()

const ES6ProxyComponentFactory = eval(`
(function (InitialParent, postConstructionAction) {
    return class ProxyComponent extends InitialParent {
        constructor(props, context) {
          super(props, context)
          postConstructionAction.call(this);
        }
    }
})
`)

const ES5ProxyComponentFactory = function(
  InitialParent,
  postConstructionAction,
) {
  function ProxyComponent(props, context) {
    InitialParent.call(this, props, context)
    postConstructionAction.call(this)
  }
  ProxyComponent.prototype = Object.create(InitialParent.prototype)
  Object.setPrototypeOf(ProxyComponent, InitialParent)
  return ProxyComponent
}

export const isReactIndeterminateResult = el =>
  el && typeof el === 'object' && !el.type && el.render

export const proxyClassCreator = doesSupportClasses
  ? ES6ProxyComponentFactory
  : ES5ProxyComponentFactory

export function getOwnKeys(target) {
  return [
    ...Object.getOwnPropertyNames(target),
    ...Object.getOwnPropertySymbols(target),
  ]
}

export function shallowStringsEqual(a, b) {
  for (const key in a) {
    if (String(a[key]) !== String(b[key])) {
      return false
    }
  }
  return true
}

export function deepPrototypeUpdate(dest, source) {
  const deepDest = Object.getPrototypeOf(dest)
  const deepSrc = Object.getPrototypeOf(source)
  if (deepDest && deepSrc && deepSrc !== deepDest) {
    deepPrototypeUpdate(deepDest, deepSrc)
  }
  if (source.prototype && source.prototype !== dest.prototype) {
    dest.prototype = source.prototype
  }
}

export function safeDefineProperty(target, key, props) {
  try {
    Object.defineProperty(target, key, props)
  } catch (e) {
    config.logger.warn('Error while wrapping', key, ' -> ', e)
  }
}
