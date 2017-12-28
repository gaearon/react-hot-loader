export function getDisplayName(Component) {
  const displayName = Component.displayName || Component.name
  return displayName && displayName !== 'ReactComponent'
    ? displayName
    : 'Unknown'
}

export const reactLifeCycleMountMethods = [
  'componentWillMount',
  'componentDidMount',
]

export function isReactClass(Component) {
  return (
    Component.prototype &&
    (Component.prototype.isReactComponent ||
      Component.prototype.componentWillMount ||
      Component.prototype.componentWillUnmount ||
      Component.prototype.componentDidMount ||
      Component.prototype.componentDidUnmount ||
      Component.prototype.render)
  )
}

export function safeReactConstructor(Component, lastInstance) {
  try {
    if (lastInstance) {
      return new Component(lastInstance.props, lastInstance.context)
    }
    return new Component({}, {})
  } catch (e) {
    // some components, like Redux connect could not be created without proper context
  }
  return null
}

export function isNativeFunction(fn) {
  return typeof fn === 'function'
    ? fn.toString().indexOf('[native code]') > 0
    : false
}

export const identity = a => a

export function getOwnKeys(target) {
  return [
    ...Object.getOwnPropertyNames(target),
    ...Object.getOwnPropertySymbols(target),
  ]
}

export function shallowStringsEqual(a, b) {
  for (const key in a) {
    if (String(a[key]) !== String(b[key])) {
      return false
    }
  }
  return true
}
