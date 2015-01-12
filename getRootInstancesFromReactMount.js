'use strict';

function getRootInstancesFromReactMount(ReactMount) {
  return ReactMount._instancesByReactRootID || ReactMount._instancesByContainerID || [];
}

module.exports = getRootInstancesFromReactMount;