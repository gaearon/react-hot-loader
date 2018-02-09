import levenshtein from 'fast-levenshtein'
import { PROXY_KEY, UNWRAP_PROXY } from '../proxy'
import { getIdByType, updateProxyById } from './proxies'
import {
  updateInstance,
  getComponentDisplayName,
  isFragmentNode,
} from '../internal/reactUtils'
import reactHotLoader from '../reactHotLoader'
import logger from '../logger'

// some `empty` names, React can autoset display name to...
const UNDEFINED_NAMES = {
  Unknown: true,
  Component: true,
}

const areNamesEqual = (a, b) =>
  a === b || (UNDEFINED_NAMES[a] && UNDEFINED_NAMES[b])
const isReactClass = fn => fn && !!fn.render
const isFunctional = fn => typeof fn === 'function'
const isArray = fn => Array.isArray(fn)
const asArray = a => (isArray(a) ? a : [a])
const getTypeOf = type => {
  if (isReactClass(type)) return 'ReactComponent'
  if (isFunctional(type)) return 'StatelessFunctional'
  return 'Fragment' // ?
}

const filterNullArray = a => {
  if (!a) return []
  return a.filter(x => !!x)
}

const unflatten = a =>
  a.reduce((acc, a) => {
    if (Array.isArray(a)) {
      acc.push(...unflatten(a))
    } else {
      acc.push(a)
    }
    return acc
  }, [])

const getElementType = child =>
  child.type[UNWRAP_PROXY] ? child.type[UNWRAP_PROXY]() : child.type

const haveTextSimilarity = (a, b) =>
  // equal or slight changed
  a === b || levenshtein.get(a, b) < a.length * 0.2

const equalClasses = (a, b) => {
  const prototypeA = a.prototype
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
        if (key === 'render') {
          misses++
        }
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
    return (
      areNamesEqual(getComponentDisplayName(a), getComponentDisplayName(b)) &&
      equalClasses(a, b)
    )
  }
  if (isFunctional(a)) {
    return (
      areNamesEqual(getComponentDisplayName(a), getComponentDisplayName(b)) &&
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

const NO_CHILDREN = { children: [] }
const mapChildren = (children, instances) => ({
  children: children.filter(c => c).map((child, index) => {
    if (typeof child !== 'object') {
      return child
    }
    if (Array.isArray(child)) {
      return {
        type: null,
        ...mapChildren(child, instances[index].children),
      }
    }
    const instanceLine = instances[index] || {}
    const oldChildren = asArray(instanceLine.children || [])
    const newChildren = asArray((child.props && child.props.children) || [])
    const nextChildren =
      oldChildren.length && mapChildren(newChildren, oldChildren)
    return {
      ...instanceLine,
      // actually child merge is needed only for TAGs, and usually don't work for Components.
      // the children from an instance or rendered children
      // while children from a props is just a props.
      // they could not exists. they could differ.
      ...(nextChildren ? { children: nextChildren } : {}),
      type: child.type,
    }
  }),
})

const mergeInject = (a, b, instance) => {
  if (a && !Array.isArray(a)) {
    return mergeInject([a], b)
  }
  if (b && !Array.isArray(b)) {
    return mergeInject(a, [b])
  }

  if (!a || !b) {
    return NO_CHILDREN
  }
  if (a.length === b.length) {
    return mapChildren(a, b)
  }

  // in some cases (no confidence here) B could contain A except null children
  // in some cases - could not.
  // this depends on React version and the way you build component.

  const nonNullA = filterNullArray(a)
  if (nonNullA.length === b.length) {
    return mapChildren(nonNullA, b)
  }

  const flatA = unflatten(nonNullA)
  const flatB = unflatten(b)
  if (flatA.length === flatB.length) {
    return mapChildren(flatA, flatB)
  }
  if (
    flatB.length === 0 &&
    flatA.length === 1 &&
    typeof flatA[0] !== 'object'
  ) {
    // terminal node
  } else {
    logger.warn(
      `React-hot-loader: unable to merge `,
      a,
      'and children of ',
      instance,
    )
  }
  return NO_CHILDREN
}

const transformFlowNode = flow =>
  flow.reduce((acc, node) => {
    if (isFragmentNode(node) && node.props && node.props.children) {
      return [...acc, ...node.props.children]
    }
    return [...acc, node]
  }, [])

let scheduledUpdates = []
let scheduledUpdate = 0

export const flushScheduledUpdates = () => {
  const instances = scheduledUpdates
  scheduledUpdates = []
  scheduledUpdate = 0
  instances.forEach(instance => updateInstance(instance))
}

const scheduleInstanceUpdate = instance => {
  scheduledUpdates.push(instance)
  if (!scheduledUpdate) {
    scheduledUpdate = setTimeout(flushScheduledUpdates)
  }
}

const hotReplacementRender = (instance, stack) => {
  const flow = transformFlowNode(filterNullArray(asArray(render(instance))))

  const { children } = stack

  flow.forEach((child, index) => {
    const stackChild = children[index]
    const next = instance => {
      // copy over props as long new component may be hidden inside them
      // child does not have all props, as long some of them can be calculated on componentMount.
      const nextProps = { ...instance.props }
      for (const key in child.props) {
        if (child.props[key]) {
          nextProps[key] = child.props[key]
        }
      }
      if (isReactClass(instance) && instance.componentWillUpdate) {
        // Force-refresh component (bypass redux renderedComponent)
        instance.componentWillUpdate(nextProps, instance.state)
      }
      instance.props = nextProps
      hotReplacementRender(instance, stackChild)
    }

    // text node
    if (typeof child !== 'object' || !stackChild || !stackChild.instance) {
      return
    }

    if (typeof child.type !== typeof stackChild.type) {
      // Portals could generate undefined !== null
      if (child.type && stackChild.type) {
        logger.warn(
          'React-hot-loader: got ',
          child.type,
          'instead of',
          stackChild.type,
        )
      }
      return
    }

    if (typeof child.type !== 'function') {
      next(
        // move types from render to the instances of hydrated tree
        mergeInject(
          asArray(child.props ? child.props.children : child.children),
          stackChild.instance.children,
          stackChild.instance,
        ),
      )
    } else {
      // unwrap proxy
      const childType = getElementType(child)
      if (!stackChild.type[PROXY_KEY]) {
        /* eslint-disable no-console */
        logger.error(
          'React-hot-loader: fatal error caused by ',
          stackChild.type,
          ' - no instrumentation found. ',
          'Please require react-hot-loader before React. More in troubleshooting.',
        )
        throw new Error('React-hot-loader: wrong configuration')
      }

      if (child.type === stackChild.type) {
        next(stackChild.instance)
      } else if (isSwappable(childType, stackChild.type)) {
        // they are both registered, or have equal code/displayname/signature

        // update proxy using internal PROXY_KEY
        updateProxyById(stackChild.type[PROXY_KEY], childType)

        next(stackChild.instance)
      } else {
        logger.warn(
          `React-hot-loader: a ${getComponentDisplayName(
            childType,
          )} was found where a ${getComponentDisplayName(
            stackChild,
          )} was expected.
          ${childType}`,
        )
      }

      scheduleInstanceUpdate(stackChild.instance)
    }
  })
}

export default (instance, stack) => {
  try {
    // disable reconciler to prevent upcoming components from proxying.
    reactHotLoader.disableProxyCreation = true
    hotReplacementRender(instance, stack)
  } catch (e) {
    logger.warn('React-hot-loader: reconcilation failed due to error', e)
  } finally {
    reactHotLoader.disableProxyCreation = false
  }
}
