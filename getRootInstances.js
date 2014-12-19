'use strict';

function getRootInstances() {
  var ReactMount = require('react/lib/ReactMount');
  return ReactMount._instancesByReactRootID || ReactMount._instancesByContainerID;
}

module.exports = getRootInstances;