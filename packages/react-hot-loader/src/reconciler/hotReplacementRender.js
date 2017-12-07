import { PROXY_KEY } from 'react-stand-in'
import levenshtein from 'fast-levenshtein'
import { getIdByType, updateProxyById } from './proxies'
import { updateInstance } from './reactUtils'

const displayName = type => type.displayName || type.name
const isReactClass = fn => !!fn.render
const isFunctional = fn => typeof fn === 'function'
const isArray = fn => Array.isArray(fn)
const asArray = a => (isArray(a) ? a : [a])
const getTypeOf = type => {
  if (isReactClass(type)) return 'ReactComponent'
  if (isFunctional(type)) return 'StatelessFunctional'
  return 'Fragment' // ?
}

const haveTextSimilarity = (a, b) =>
  // equal or slight change
  a === b || levenshtein.get(a, b) < a.length * 0.2

const equalClasses = (a, b) => {
  // prototypeA - the real class
  const prototypeA = a.prototype
  // prototypeB - the proxied component
  const prototypeB = Object.getPrototypeOf(b.prototype)

  let hits = 0
  let misses = 0
  Object.getOwnPropertyNames(prototypeA).forEach(key => {
    if (typeof prototypeA[key] === 'function') {
      if (
        haveTextSimilarity(String(prototypeA[key]), String(prototypeB[key]))
      ) {
        hits++
      } else {
        misses++
      }
    }
  })
  // allow to add or remove one function
  return hits > 0 && misses <= 1
}

const isSwappable = (a, b) => {
  // both are registered components
  if (getIdByType(b) && getIdByType(a) === getIdByType(b)) {
    return true
  }
  if (getTypeOf(a) !== getTypeOf(b)) {
    return false
  }
  if (isReactClass(a.prototype)) {
    return displayName(a) === displayName(b) && equalClasses(a, b)
  }
  if (isFunctional(a)) {
    return (
      displayName(a) === displayName(b) &&
      haveTextSimilarity(String(a), String(b))
    )
  }
  return false
}

const render = component => {
  if (!component) {
    return []
  }
  if (isReactClass(component)) {
    return component.render()
  }
  if (isArray(component)) {
    return component.map(render)
  }
  if (component.children) {
    return component.children
  }

  return []
}

const mergeInject = (a, b) => {
  if (a.length !== b.length) {
    return { children: [] }
  }
  return {
    children: a.map((child, index) => {
      if (typeof child !== 'object') {
        return child
      }
      return {
        ...b[index],
        type: child.type,
      }
    }),
  }
}

const hotReplacementRender = (instance, stack) => {
  // disable reconciler to prevent upcoming components from proxying.
  __REACT_HOT_LOADER__.reconciler = false
  const flow = asArray(render(instance))
  __REACT_HOT_LOADER__.reconciler = true

  const { children } = stack

  flow.forEach((child, index) => {
    const stackChild = children[index]
    const next = instance => hotReplacementRender(instance, stackChild)

    // text node
    if (typeof child !== 'object') {
      return
    }
    if (typeof child.type !== 'function') {
      next(
        // move types from render to the instances of hydrated tree
        mergeInject(
          child.props ? child.props.children : child.children,
          stackChild.instance.children,
        ),
      )
    } else {
      if (child.type === stackChild.type) {
        next(stackChild.instance)
      } else if (isSwappable(child.type, stackChild.type)) {
        // they are both registered, or have equal code/displayname/signature
        // TODO: one could not find proxy by proxy, only by original type
        // as result one could not use type from rendered tree to gather Id

        // update proxy using internal PROXY_KEY
        updateProxyById(stackChild.instance[PROXY_KEY], child.type)

        // swap(child.type, stackChild.type);
        next(stackChild.instance)
      }
      updateInstance(stackChild.instance)
    }
  })
}

export default hotReplacementRender
