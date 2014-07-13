module.exports = function () {};
module.exports.pitch = function (remainingRequest) {
  this.cacheable && this.cacheable();
  var patchedModuleRequest = '!!' + require.resolve('./replaceCreateClass') + '!' + remainingRequest;

  return [
    'var React = require("react")',
    'var hot = require(' + JSON.stringify(require.resolve('./hot')) + ')(React);',
    'module.exports = require(' + JSON.stringify(patchedModuleRequest) + ')(hot.createClass);',
    'if (module.hot) {',
    '  module.hot.accept(' + JSON.stringify(patchedModuleRequest) + ', function () {',
    '    require(' + JSON.stringify(patchedModuleRequest) + ')(hot.updateClass);',
    '  });',
    '}',
  ].join('\n');
};
