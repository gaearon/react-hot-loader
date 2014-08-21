'use strict';

var updaters = {},
    makeModuleUpdater = require('./makeModuleUpdater');

function getHotUpdateAPI(React, filename, moduleId) {
  var exists = updaters.hasOwnProperty(moduleId);
  if (!exists) {
    updaters[moduleId] = makeModuleUpdater(React, filename);
  }

  var updater = updaters[moduleId];
  return {
    createClass: exists ? updater.updateClass : updater.createClass,
    updateMountedInstances: updater.updateMountedInstances
  };
}

module.exports = getHotUpdateAPI;