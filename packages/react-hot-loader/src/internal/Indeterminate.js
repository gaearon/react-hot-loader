import { createElement } from 'React'
import { DO_NOT_PROXY_KEY } from 'react-stand-in'

export const INDETERMINATE = 'indeterminate_classInstance'

function Indeterminate(props) {
  // copy over pros
  const classInstance = props[INDETERMINATE]
  classInstance.props = props
  return classInstance
}

Indeterminate[DO_NOT_PROXY_KEY] = true

function wrapWithStateless(classInstance, props) {
  return createElement(Indeterminate, {
    ...props,
    [INDETERMINATE]: classInstance,
  })
}

const isReactIndeterminateResult = el =>
  el && typeof el === 'object' && !el.type && el.render

const processIndeterminate = (element, props, wrapper) =>
  isReactIndeterminateResult(element)
    ? wrapWithStateless(element, props)
    : element

export default processIndeterminate
