'use strict';

var makeAssimilatePrototype = require('./makeAssimilatePrototype'),
    requestForceUpdateAll = require('./requestForceUpdateAll');

function hasLegacyTypeProperty(ReactClass) {
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
  var prototype = ReactClass.prototype;

  if (typeof prototype.render !== 'function' && hasLegacyTypeProperty(ReactClass)) {
    prototype = ReactClass.type.prototype;
  }

  return prototype;
}

/**
 * Returns a function that will patch React class with new versions of itself
 * on subsequent invocations. Both legacy and ES6 style classes are supported.
 */
module.exports = function makePatchReactClass(getRootInstances) {
  var assimilatePrototype = makeAssimilatePrototype(),
      FirstClass = null;

  return function patchReactClass(NextClass) {
    var nextPrototype = getPrototype(NextClass);
    assimilatePrototype(nextPrototype);

    if (FirstClass) {
      requestForceUpdateAll(getRootInstances);
    }

    return FirstClass || (FirstClass = NextClass);
  };
};