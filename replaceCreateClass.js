module.exports = function (source) {
  this.cacheable && this.cacheable();
  return [
    'module.exports = function replaceCreateClass(createClassProxy) {',
      source.replace(/React\.createClass/g, 'createClassProxy'),
    '  var Component = module.exports;',
    '  module.exports = replaceCreateClass;',
    '  return Component;',
    '}'
  ].join('\n');
};
