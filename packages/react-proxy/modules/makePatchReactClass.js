'use strict';

var makeAssimilatePrototype = require('./makeAssimilatePrototype'),
    requestForceUpdateAll = require('./requestForceUpdateAll'),
    React = require('react');

/**
 * Returns a function that will patch React class with new versions of itself
 * on subsequent invocations. Both legacy and ES6 style classes are supported.
 */
module.exports = function makePatchReactClass() {
  var assimilatePrototype = makeAssimilatePrototype(),
      FirstClass = null;

  return function patchReactClass(NextClass) {
    if (!NextClass) {
      return NextClass;
    }

    var nextPrototype = (NextClass.type || NextClass).prototype;
    if (!nextPrototype || !nextPrototype.render) {
      return NextClass;
    }

    assimilatePrototype(nextPrototype);
    requestForceUpdateAll();

    return FirstClass || (FirstClass = NextClass);
  };
};