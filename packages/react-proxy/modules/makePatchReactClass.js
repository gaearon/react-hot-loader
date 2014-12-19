'use strict';

var makeAssimilatePrototype = require('./makeAssimilatePrototype'),
    requestForceUpdateAll = require('./requestForceUpdateAll');

/**
 * Returns a function that will patch React class with new versions of itself
 * on subsequent invocations. Both legacy and ES6 style classes are supported.
 */
module.exports = function makePatchReactClass(getRootInstances) {
  var assimilatePrototype = makeAssimilatePrototype(),
      FirstClass = null;

  return function patchReactClass(NextClass) {
    if (!NextClass) {
      return NextClass;
    }

    var nextPrototype = (NextClass.type || NextClass).prototype,
        typeHasReactClassPrototype = nextPrototype && typeof nextPrototype.render === 'function',
        isReactElement = typeHasReactClassPrototype && NextClass.props;

    if (!typeHasReactClassPrototype || isReactElement) {
      return NextClass;
    }

    assimilatePrototype(nextPrototype);

    if (FirstClass) {
      requestForceUpdateAll(getRootInstances);
    }

    return FirstClass || (FirstClass = NextClass);
  };
};