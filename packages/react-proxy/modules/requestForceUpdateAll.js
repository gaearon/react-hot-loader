var deepForceUpdate = require('./deepForceUpdate');

var isRequestPending = false;

module.exports = function requestForceUpdateAll(getRootInstances) {
  if (isRequestPending) {
    return;
  }

  /**
   * Forces deep re-render of all mounted React components.
   * Hat's off to Omar Skalli (@Chetane) for suggesting this approach:
   * https://gist.github.com/Chetane/9a230a9fdcdca21a4e29
   */
  function forceUpdateAll() {
    isRequestPending = false;

    var rootInstances = getRootInstances(),
        rootInstance;

    for (var key in rootInstances) {
      if (rootInstances.hasOwnProperty(key)) {
        deepForceUpdate(rootInstances[key]);
      }
    }
  }

  setTimeout(forceUpdateAll);
};