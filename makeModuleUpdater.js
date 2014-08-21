'use strict';

/**
 * Provides `createClass` and `updateClass` which can be used as drop-in
 * replacement for `React.createClass` in a module. If multiple components
 * are defined in the same module, assumes their `displayName`s are different.
 */
module.exports = function (React, filename) {
  var componentUpdaters = {};

  function createClass(spec) {
    var displayName = spec.displayName,
        componentUpdater;

    if (componentUpdaters[displayName]) {
      throw new Error(
        'Found duplicate displayName in ' + filename + ': "' + displayName + '".\n' +
        'react-hot-loader uses displayName to distinguish between several components in one file.'
      );
    }

    componentUpdater = require('./makeComponentUpdater')(React);
    componentUpdaters[displayName] = componentUpdater;

    return componentUpdater.createClass(spec);
  }

  function updateClass(spec) {
    var displayName = spec.displayName,
        componentUpdater = componentUpdaters[displayName];

    return componentUpdater ?
      componentUpdater.updateClass(spec) :
      createClass(spec);
  }

  function updateMountedInstances() {
    Object.keys(componentUpdaters).forEach(function (displayName) {
      componentUpdaters[displayName].updateMountedInstances();
    });
  }

  return {
    createClass: createClass,
    updateClass: updateClass,
    updateMountedInstances: updateMountedInstances
  };
};