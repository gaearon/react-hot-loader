module.exports = function () {};
module.exports.pitch = function (remainingRequest) {
  this.cacheable && this.cacheable();
  var patchedModuleRequest = '!!' + require.resolve('./replaceCreateClass') + '!' + remainingRequest;

  return [
    'var HotUpdateMixin = require(' + JSON.stringify(require.resolve('./makeHotUpdateMixin')) + ')();',
    'function createHotClass(spec) {',
    '  if (!spec.mixins) spec.mixins = [];',
    '  spec.mixins.push(HotUpdateMixin.Mixin);',
    '  return require("react").createClass(spec);',
    '};',
    'if (module.hot) {',
    '  module.hot.accept(' + JSON.stringify(patchedModuleRequest) + ', function() {',
    '    module.exports = require(' + JSON.stringify(patchedModuleRequest) + ')(createHotClass);',
    '    HotUpdateMixin.acceptUpdate(module.exports);',
    '  });',
    '}',
    'module.exports = require(' + JSON.stringify(patchedModuleRequest) + ')(createHotClass);'
  ].join('\n');
};
