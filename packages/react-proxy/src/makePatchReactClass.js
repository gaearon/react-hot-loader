'use strict';

var makeAssimilatePrototype = require('./makeAssimilatePrototype'),
    requestForceUpdateAll = require('./requestForceUpdateAll');

function hasNonStubTypeProperty(ReactClass) {
  if (!ReactClass.hasOwnProperty('type')) {
    return false;
  }

  var descriptor = Object.getOwnPropertyDescriptor(ReactClass, 'type');
  if (typeof descriptor.get === 'function') {
    return false;
  }

  return true;
}

function getPrototype(ReactClass) {
  var prototype = ReactClass.prototype,
      seemsLegit = prototype && typeof prototype.render === 'function';

  if (!seemsLegit && hasNonStubTypeProperty(ReactClass)) {
    prototype = ReactClass.type.prototype;
  }

  return prototype;
}

/**
 * Returns a function that will patch React class with new versions of itself
 * on subsequent invocations. Both legacy and ES6 style classes are supported.
 */
module.exports = function makePatchReactClass(getRootInstances, React) {
  var assimilatePrototype = makeAssimilatePrototype(),
      FirstClass = null;

  return function patchReactClass(NextClass) {
    var nextPrototype = getPrototype(NextClass);
    assimilatePrototype(nextPrototype);

    if (FirstClass) {
      requestForceUpdateAll(getRootInstances, React);
    }

    return FirstClass || (FirstClass = NextClass);
  };
};