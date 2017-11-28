function getDisplayName(Component) {
  const displayName = Component.displayName || Component.name;
  return (displayName && displayName !== 'ReactComponent')
    ? displayName
    : 'Unknown';
}

function isReactClass(Component) {
  return Component.prototype && (
    Component.prototype.isReactComponent ||
    Component.prototype.componentWillMount ||
    Component.prototype.componentWillUnmount ||
    Component.prototype.componentDidMount ||
    Component.prototype.componentDidUnmount ||
    Component.prototype.render
  );
}

function isNativeFunction (fn) {
  return typeof fn === 'function'
    ? fn.toString().indexOf('[native code]') > 0
    : false
}

const reactLifeCycleMethods = [
  'componentWillMount',
  'componentDidMount',
];

export {
  getDisplayName,
  isNativeFunction,
  isReactClass,
  reactLifeCycleMethods
}
