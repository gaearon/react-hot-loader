var deepForceUpdate = require('./deepForceUpdate');

var isRequestPending = false;

/**
 * Forces deep re-render of all mounted React components.
 * Hat's off to Omar Skalli (@Chetane) for suggesting this approach:
 * https://gist.github.com/Chetane/9a230a9fdcdca21a4e29
 */
function forceUpdateAll(ReactMount) {
  isRequestPending = false;

  var rootInstances = ReactMount._instancesByReactRootID || ReactMount._instancesByContainerID,
      rootInstance;

  for (var key in rootInstances) {
    if (rootInstances.hasOwnProperty(key)) {
      deepForceUpdate(rootInstances[key]);
    }
  }
}

module.exports = function requestForceUpdateAll() {
  if (!isRequestPending) {
    setTimeout(forceUpdateAll, 0);
  }
};