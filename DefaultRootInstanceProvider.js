'use strict';

module.exports = {
  getRootInstances: function () {
    var ReactMount = require('react/lib/ReactMount');
    return ReactMount._instancesByReactRootID || ReactMount._instancesByContainerID;
  }
};