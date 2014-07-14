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
    'var React = require("react")',
    'var hot = require(' + JSON.stringify(require.resolve('./hot')) + ')(React);',
    'var notify = require(' + JSON.stringify(require.resolve('./notify')) + ')(' + JSON.stringify(query.notify) + ');',
    'module.exports = require(' + JSON.stringify(patchedModuleRequest) + ')(hot.createClass);',
    'if (module.hot) {',
    '  module.hot.accept(' + JSON.stringify(patchedModuleRequest) + ', function () {',
    '    try {',
    '      module.exports = require(' + JSON.stringify(patchedModuleRequest) + ')(hot.updateClass);',
    '      notify.success(' + JSON.stringify(originalFilename) + ')',
    '    } catch (err) {',
    '      notify.failure(' + JSON.stringify(originalFilename) + ', err)',
    '    }',
    '  });',
    '}',
  ].join('\n');
};
