// the if statement is to prevent patching again when using mocha watch mode
if (!require('react').createElement.isPatchedByReactHotLoader)
  require('../../src/patch.dev')

// copied from https://github.com/lelandrichardson/enzyme-example-mocha/blob/master/test/.setup.js
var jsdom = require('jsdom').jsdom;

var exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};
