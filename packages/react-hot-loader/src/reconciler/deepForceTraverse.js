import { getIdByType, updateProxyById } from './proxies'
import { PROXY_KEY } from 'react-stand-in'

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

const haveTextSimilarity = (a, b) => {
  // return levenstein(a,b) < length(a)/10
  return a === b
}

const equalClasses = (a, b) => {
  const prototypeA = a.prototype
  const prototypeB = b.prototype
  let hit = 0
  let miss = 0
  Object.getOwnPropertyNames(prototypeA).forEach(key => {
    if (typeof prototypeA[key] === 'function') {
      if (
        haveTextSimilarity(String(prototypeA[key]), String(prototypeB[key]))
      ) {
        hit++
      } else {
        miss++
      }
    }
  })
  return hit > 0 && miss <= 1
}

const swappable = (a, b) => {
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

const swap = (newClass, oldClass) => {
  let id = getIdByType(oldClass)
  updateProxyById(id, newClass)
}

function callFunctionalComponent(component, props, context) {
  return component(props, context)
}

const render = (component, stack) => {
  if (!component) {
    return []
  }
  if (isReactClass(component)) {
    return component.render()
  }
  if (isFunctional(component)) {
    return callFunctionalComponent(component, stack.props, stack.context)
  }
  if (isArray(component)) {
    return component.map(render)
  }
  if (component.children) {
    return component.children
  }

  return []
}

const mergeChildren = (a, b) => {
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

const deepForceTraverse = (instance, stack) => {
  __REACT_HOT_LOADER__.reconciler = false
  const flow = asArray(render(instance, stack))
  __REACT_HOT_LOADER__.reconciler = true

  const children = stack.children

  flow.forEach((child, index) => {
    const stackChild = children[index]
    const next = ins => deepForceTraverse(ins, stackChild)
    if (typeof child !== 'object') {
      return
    }
    if (typeof child.type !== 'function') {
      next(
        mergeChildren(
          child.props ? child.props.children : child.children,
          stackChild.ins.children,
        ),
      )
    } else if (child.type === stackChild.type) {
      next(stackChild.ins)
    } else if (swappable(child.type, stackChild.type)) {
      // they are both registered, or have equal code/displayname/signature
      // TODO: one could not find proxy by proxy, only by original type
      // as result one could not use type from rendered tree to gather Id

      // update proxy using internal PROXY_KEY
      updateProxyById(stackChild.ins[PROXY_KEY], child.type)

      // swap(child.type, stackChild.type);
      next(stackChild.ins)
    }
  })
}

export default deepForceTraverse
