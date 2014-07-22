var path = require('path'),
    loaderUtils = require('loader-utils');

module.exports = function () {};
module.exports.pitch = function (remainingRequest) {
  this.cacheable && this.cacheable();

  var patchedModuleRequest = '!!' + require.resolve('./replaceCreateClass') + '!' + remainingRequest,
      originalFilename = path.basename(remainingRequest),
      query = loaderUtils.parseQuery(this.query);

  query.notify = query.notify || 'none';

  return [
    'var React = require("react");',
    'var notifier = require(' + JSON.stringify(require.resolve('./makeNotifier')) + ')(' + JSON.stringify(originalFilename) + ', ' + JSON.stringify(query.notify) + ');',
    'var moduleUpdater = require(' + JSON.stringify(require.resolve('./makeModuleUpdater')) + ')(' + JSON.stringify(originalFilename) + ', React);',

    'module.exports = require(' + JSON.stringify(patchedModuleRequest) + ')(moduleUpdater.createClass);',

    'if (module.hot && moduleUpdater.canUpdateModule() && React.isValidClass(module.exports)) {',
    '  module.hot.accept(' + JSON.stringify(patchedModuleRequest) + ', function () {',
    '    try {',
    '      require(' + JSON.stringify(patchedModuleRequest) + ')(moduleUpdater.updateClass);',
    '      moduleUpdater.updateMountedInstances();',
    '      notifier.handleSuccess()',
    '    } catch (err) {',
    '      notifier.handleFailure(err)',
    '    }',
    '  });',
    '}'
  ].join('\n');
};
