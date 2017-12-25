import {PROXY_KEY, UNWRAP_PROXY} from 'react-stand-in'
import levenshtein from 'fast-levenshtein'
import {getIdByType, updateProxyById} from './proxies'
import {updateInstance} from './reactUtils'
import {getDisplayName} from '../utils.dev'

// some `empty` names, React can autoset display name to...
const UNDEFINED_NAMES = {
  Unknown: true,
  Component: true,
}

const displayName = type => type.displayName || type.name || 'Unknown'
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
    return areNamesEqual(displayName(a), displayName(b)) && equalClasses(a, b)
  }
  if (isFunctional(a)) {
    return (
      areNamesEqual(displayName(a), displayName(b)) &&
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
    if (component.componentWillUpdate) {
      // force-refresh component (bypass redux renderedComponent)
      component.componentWillUpdate()
    }
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
  if (a && !Array.isArray(a)) {
    return mergeInject([a], b)
  }
  if (b && !Array.isArray(b)) {
    return mergeInject(a, [b])
  }

  if (a.length !== b.length) {
    return {children: []}
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
  const flow = filterNullArray(asArray(render(instance)))

  const {children} = stack

  flow.forEach((child, index) => {
    const stackChild = children[index]
    const next = instance => {
      // copy over props as long new component may be hidden inside them
      // child does not have all props, as long some of them can be calculated on componentMount.
      const props = {...instance.props};
      for (const key in child.props) {
        if (child.props[key]) {
          props[key] = child.props[key];
        }
      }
      instance.props = props;
      hotReplacementRender(instance, stackChild)
    }

    // text node
    if (typeof child !== 'object' || !child.type || !stackChild.instance) {
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
        ),
      )
    } else {
      // unwrap proxy
      const childType = getElementType(child)

      if (child.type === stackChild.type) {
        next(stackChild.instance)
      } else if (isSwappable(childType, stackChild.type)) {
        // they are both registered, or have equal code/displayname/signature

        // update proxy using internal PROXY_KEY
        updateProxyById(stackChild.instance[PROXY_KEY], childType)

        next(stackChild.instance)
      } else if (__REACT_HOT_LOADER__.warnings) {
        console.warn(
          `React-hot-loader: a ${getDisplayName(
            childType,
          )} was found where a ${getDisplayName(stackChild)} was expected.
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
    __REACT_HOT_LOADER__.disableComponentProxy = true
    hotReplacementRender(instance, stack)
  } finally {
    __REACT_HOT_LOADER__.disableComponentProxy = false
  }
}
