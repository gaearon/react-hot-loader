module.exports = function() {};
module.exports.pitch = function (remainingRequest) {
  this.cacheable && this.cacheable();
  var displayName = this.query.substring(1);
  var moduleRequest = "!!" + remainingRequest;

  return [
    'var HotUpdateMixin = require(' + JSON.stringify(require.resolve('./makeHotUpdateMixin')) + ')();',
    'var React = require("react");',
    'function runWithMonkeyPatchedReact(f) {',
    '  var realCreateClass = React.createClass;',
    '  var injected = 0;',
    '  React.createClass = function createHotUpdateClass(spec) {',
    '    if (spec.displayName === ' + JSON.stringify(displayName) + ') {',
    '      if (!spec.mixins) spec.mixins = [];',
    '      spec.mixins.push(HotUpdateMixin.Mixin);',
    '      injected++;',
    '    }',
    '    return realCreateClass(spec);',
    '  };',
    '  f();',
    '  if (injected === 0) {',
    '    console.warn(\'Could not find component with displayName: ' + JSON.stringify(displayName) + '\');',
    '  } else if (injected > 1) {',
    '    console.warn(\'Found more than one component with displayName: ' + JSON.stringify(displayName) + '\');',
    '  }',
    '  React.createClass = realCreateClass;',
    '}',
    'runWithMonkeyPatchedReact(function () {',
    '  module.exports = require(' + JSON.stringify(moduleRequest) + ');',
    '});',
    'if (module.hot) {',
    '  module.hot.accept(' + JSON.stringify(moduleRequest) + ', function() {',
    '    runWithMonkeyPatchedReact(function () {',
    '      module.exports = require(' + JSON.stringify(moduleRequest) + ');',
    '    });',
    '    HotUpdateMixin.acceptUpdate(module.exports);',
    '  });',
    '}'
  ].join('\n');
};
