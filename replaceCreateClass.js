module.exports = function (source) {
  this.cacheable && this.cacheable();
  return [
    'module.exports = function replaceCreateClass(createHotClass) {',
      source.replace('React.createClass', 'createHotClass'),
    '  var Component = module.exports;',
    '  module.exports = replaceCreateClass;',
    '  return Component;',
    '}'
  ].join('\n');
};
