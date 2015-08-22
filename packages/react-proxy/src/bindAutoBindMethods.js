/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of React source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * Original:
 * https://github.com/facebook/react/blob/6508b1ad273a6f371e8d90ae676e5390199461b4/src/isomorphic/classic/class/ReactClass.js#L650-L713
 */

function bindAutoBindMethod(component, method) {
  var boundMethod = method.bind(component);

  boundMethod.__reactBoundContext = component;
  boundMethod.__reactBoundMethod = method;
  boundMethod.__reactBoundArguments = null;

  var componentName = component.constructor.displayName,
      _bind = boundMethod.bind;

  boundMethod.bind = function (newThis) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (newThis !== component && newThis !== null) {
      console.warn(
        'bind(): React component methods may only be bound to the ' +
        'component instance. See ' + componentName
      );
    } else if (!args.length) {
      console.warn(
        'bind(): You are binding a component method to the component. ' +
        'React does this for you automatically in a high-performance ' +
        'way, so you can safely remove this call. See ' + componentName
      );
      return boundMethod;
    }

    var reboundMethod = _bind.apply(boundMethod, arguments);
    reboundMethod.__reactBoundContext = component;
    reboundMethod.__reactBoundMethod = method;
    reboundMethod.__reactBoundArguments = args;

    return reboundMethod;
  };

  return boundMethod;
}

/**
 * Deletes autobound methods that are no longer in autobind map.
 */
export function deleteUnknownAutoBindMethods(component) {
  if (!component.__reactAutoBindMap) {
    return;
  }

  for (var name in component) {
    if (
      component.hasOwnProperty(name) &&
      !component.__reactAutoBindMap.hasOwnProperty(name) &&
      typeof Object.getOwnPropertyDescriptor(component, name).value === 'function' &&
      component[name].__reactBoundArguments === null
    ) {
      delete component[name];
    }
  }
}

export function bindAutoBindMethods(component) {
  for (var autoBindKey in component.__reactAutoBindMap) {
    if (component.__reactAutoBindMap.hasOwnProperty(autoBindKey)) {
      var method = component.__reactAutoBindMap[autoBindKey];
      component[autoBindKey] = bindAutoBindMethod(component, method);
    }
  }
};