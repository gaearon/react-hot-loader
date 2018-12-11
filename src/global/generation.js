let generation = 1
let hotComparisonCounter = 0
const nullFunction = () => {}
let onHotComparisonOpen = nullFunction
let onHotComparisonElement = nullFunction
let onHotComparisonClose = nullFunction

export const setComparisonHooks = (open, element, close) => {
  onHotComparisonOpen = open
  onHotComparisonElement = element
  onHotComparisonClose = close
}

export const getElementComparisonHook = () => onHotComparisonElement

export const hotComparisonOpen = () => hotComparisonCounter > 0

const incrementHot = () => {
  if (!hotComparisonCounter) {
    onHotComparisonOpen()
  }
  hotComparisonCounter++
}
const decrementHot = () => {
  hotComparisonCounter--
  if (!hotComparisonCounter) {
    onHotComparisonClose()
  }
}

export const enterHotUpdate = () => {
  Promise.resolve(incrementHot()).then(() => setTimeout(decrementHot, 0))
}

export const increment = () => {
  enterHotUpdate()
  return generation++
}
export const get = () => generation
