module.exports = function (source) {
  this.cacheable && this.cacheable();
  return [
    'module.exports = function makeWithHotClass(createHotClass) {',
      source.replace('React.createClass', 'createHotClass'),
    '  var Component = module.exports;',
    '  module.exports = makeWithHotClass;',
    '  return Component;',
    '}'
  ].join('\n');
};
