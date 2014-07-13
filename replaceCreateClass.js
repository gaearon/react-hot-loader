module.exports = function (source) {
  return [
    'module.exports = function makeWithHotClass(createHotClass) {',
      source.replace('React.createClass', 'createHotClass'),
    '  var Component = module.exports;',
    '  module.exports = makeWithHotClass;',
    '  return Component;',
    '}'
  ].join('\n');
};
