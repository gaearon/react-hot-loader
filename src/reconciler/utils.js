import levenshtein from 'fast-levenshtein'
import { getIdByType } from './proxies'
import { getComponentDisplayName, isReactClass } from '../internal/reactUtils'
import { UNWRAP_PROXY } from '../proxy'

// some `empty` names, React can autoset display name to...
const UNDEFINED_NAMES = {
  Unknown: true,
  Component: true,
}

const areNamesEqual = (a, b) =>
  a === b || (UNDEFINED_NAMES[a] && UNDEFINED_NAMES[b])

const isFunctional = fn => typeof fn === 'function'
const getTypeOf = type => {
  if (isReactClass(type)) return 'ReactComponent'
  if (isFunctional(type)) return 'StatelessFunctional'
  return 'Fragment' // ?
}

const haveTextSimilarity = (a, b) =>
  // equal or slight changed
  a === b || levenshtein.get(a, b) < a.length * 0.2

const equalClasses = (a, b) => {
  const prototypeA = a.prototype
  const prototypeB = Object.getPrototypeOf(b.prototype)

  let hits = 0
  let misses = 0
  let comparisons = 0
  Object.getOwnPropertyNames(prototypeA).forEach(key => {
    const descriptorA = Object.getOwnPropertyDescriptor(prototypeA, key)
    const valueA =
      descriptorA && (descriptorA.value || descriptorA.get || descriptorA.set)
    const descriptorB = Object.getOwnPropertyDescriptor(prototypeB, key)
    const valueB =
      descriptorB && (descriptorB.value || descriptorB.get || descriptorB.set)

    if (typeof valueA === 'function' && key !== 'constructor') {
      comparisons++
      if (haveTextSimilarity(String(valueA), String(valueB))) {
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
  return (hits > 0 && misses <= 1) || comparisons === 0
}

export const areSwappable = (a, b) => {
  // both are registered components and have the same name
  if (getIdByType(b) && getIdByType(a) === getIdByType(b)) {
    return true
  }
  if (getTypeOf(a) !== getTypeOf(b)) {
    return false
  }
  if (isReactClass(a)) {
    return (
      areNamesEqual(getComponentDisplayName(a), getComponentDisplayName(b)) &&
      equalClasses(a, b)
    )
  }

  if (isFunctional(a)) {
    const nameA = getComponentDisplayName(a)
    return (
      (areNamesEqual(nameA, getComponentDisplayName(b)) &&
        nameA !== 'Component') ||
      haveTextSimilarity(String(a), String(b))
    )
  }
  return false
}
