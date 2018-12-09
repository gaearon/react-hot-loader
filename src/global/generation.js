let generation = 1
let hotComparisonCounter = 0

export const hotComparisonOpen = () => hotComparisonCounter > 0

const incrementHot = () => hotComparisonCounter++
const decrementHot = () => hotComparisonCounter--

export const enterHotUpdate = () => {
  Promise.resolve(incrementHot()).then(decrementHot)
}

export const increment = () => {
  enterHotUpdate()
  return generation++
}
export const get = () => generation
