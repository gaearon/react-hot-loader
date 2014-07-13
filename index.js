module.exports = function () {};
module.exports.pitch = function (remainingRequest) {
  this.cacheable && this.cacheable();
  var displayName = this.query.substring(1);
  var moduleRequest = "!!" + remainingRequest;

  return [
    'var HotUpdateMixin = require(' + JSON.stringify(require.resolve('./makeHotUpdateMixin')) + ')();',
    'function createHotClass(spec) {',
    '  if (!spec.mixins) spec.mixins = [];',
    '  spec.mixins.push(HotUpdateMixin.Mixin);',
    '  return require("react").createClass(spec);',
    '};',
    'if (module.hot) {',
    '  module.hot.accept(' + JSON.stringify('!!replaceCreateClass!' + moduleRequest) + ', function() {',
    '    module.exports = require(' + JSON.stringify('!!replaceCreateClass!' + moduleRequest) + ')(createHotClass);',
    '    HotUpdateMixin.acceptUpdate(module.exports);',
    '  });',
    '}',
    'module.exports = require(' + JSON.stringify('!!replaceCreateClass!' + moduleRequest) + ')(createHotClass);'
  ].join('\n');
};
