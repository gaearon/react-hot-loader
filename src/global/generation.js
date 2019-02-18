import { forEachKnownClass } from '../proxy/createClassProxy'

let generation = 1
let hotComparisonCounter = 0
let hotComparisonRuns = 0
const nullFunction = () => ({})
let onHotComparisonOpen = nullFunction
let onHotComparisonElement = nullFunction
let onHotComparisonClose = nullFunction

export const setComparisonHooks = (open, element, close) => {
  onHotComparisonOpen = open
  onHotComparisonElement = element
  onHotComparisonClose = close
}

export const getElementComparisonHook = component =>
  onHotComparisonElement(component)
export const getElementCloseHook = component => onHotComparisonClose(component)

export const hotComparisonOpen = () =>
  hotComparisonCounter > 0 && hotComparisonRuns > 0

const openGeneration = () => forEachKnownClass(onHotComparisonElement)

export const closeGeneration = () => forEachKnownClass(onHotComparisonClose)

const incrementHot = () => {
  if (!hotComparisonCounter) {
    openGeneration()
    onHotComparisonOpen()
  }
  hotComparisonCounter++
}
const decrementHot = () => {
  hotComparisonCounter--
  if (!hotComparisonCounter) {
    closeGeneration()
    hotComparisonRuns++
  }
}

export const configureGeneration = (counter, runs) => {
  hotComparisonCounter = counter
  hotComparisonRuns = runs
}

export const enterHotUpdate = () => {
  Promise.resolve(incrementHot()).then(() => setTimeout(decrementHot, 0))
}

export const increment = () => {
  enterHotUpdate()
  return generation++
}
export const get = () => generation
