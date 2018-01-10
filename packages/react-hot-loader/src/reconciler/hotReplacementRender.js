import { PROXY_KEY, UNWRAP_PROXY } from 'react-stand-in'
import levenshtein from 'fast-levenshtein'
import { getIdByType, updateProxyById } from './proxies'
import { updateInstance, getComponentDisplayName } from '../internal/reactUtils'
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
    return {
      ...instances[index],
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
  const flatA = unflatten(a)
  const flatB = unflatten(b)
  if (flatA.length === flatB.length) {
    return mapChildren(flatA, flatB)
  }
  logger.warn(
    `React-hot-loader: unable to merge `,
    a,
    'and children of ',
    instance,
  )
  return NO_CHILDREN
}

const hotReplacementRender = (instance, stack) => {
  const flow = filterNullArray(asArray(render(instance)))

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

    if (typeof child.type !== 'function') {
      next(
        // move types from render to the instances of hydrated tree
        mergeInject(
          filterNullArray(
            asArray(child.props ? child.props.children : child.children),
          ),
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

      updateInstance(stackChild.instance)
    }
  })
}

export default (instance, stack) => {
  try {
    // disable reconciler to prevent upcoming components from proxying.
    reactHotLoader.disableProxyCreation = true
    hotReplacementRender(instance, stack)
  } finally {
    reactHotLoader.disableProxyCreation = false
  }
}
