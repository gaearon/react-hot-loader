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
    'var notify = require(' + JSON.stringify(require.resolve('./notify')) + ')(' + JSON.stringify(query.notify) + ');',
    'var hots = {};',
    'function hotCreateClass(spec) {',
    '  var displayName = spec.displayName;',
    '  if (hots[displayName]) {',
    '    console.warn("Found duplicate displayName: " + displayName + " in ' + originalFilename + '.\\n" +',
    '                 "react-hot-loader uses displayName to distinguish between several components in the same file.");',
    '  }',
    '  var hot = require(' + JSON.stringify(require.resolve('./hot')) + ')(React);',
    '  hots[displayName] = hot;',
    '  return hot.createClass(spec);',
    '}',
    'function hotUpdateClass(spec) {',
    '  var displayName = spec.displayName;',
    '  if (!hots[displayName]) {',
    '    return hotCreateClass(spec);',
    '  }',
    '  return hots[spec.displayName].createClass(spec);',
    '}',
    'module.exports = require(' + JSON.stringify(patchedModuleRequest) + ')(hotCreateClass);',
    'if (module.hot && Object.keys(hots).length > 0) {',
    '  module.hot.accept(' + JSON.stringify(patchedModuleRequest) + ', function () {',
    '    try {',
    '      require(' + JSON.stringify(patchedModuleRequest) + ')(hotUpdateClass);',
    '      Object.keys(hots).forEach(function (key) {',
    '        hots[key].updateMountedInstances();',
    '      });',
    '      notify.success(' + JSON.stringify(originalFilename) + ')',
    '    } catch (err) {',
    '      notify.failure(' + JSON.stringify(originalFilename) + ', err)',
    '    }',
    '  });',
    '}'
  ].join('\n');
};
