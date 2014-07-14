'use strict';

module.exports = function (React) {
  var mounted = [];
  var Mixin = {
    componentDidMount: function () {
      mounted.push(this);
    },

    componentWillUnmount: function () {
      mounted.splice(mounted.indexOf(this), 1);
    }
  };

  var assimilatePrototype = (function () {
    var storedPrototype,
        knownPrototypes = [];

    function wrapFunction(key) {
      return function () {
        if (storedPrototype[key]) {
          return storedPrototype[key].apply(this, arguments);
        }
      };
    }

    function patchProperty(proto, key) {
      proto[key] = storedPrototype[key];

      if (typeof proto[key] !== 'function' ||
        key === 'type' ||
        key === 'constructor') {
        return;
      }

      proto[key] = wrapFunction(key);

      if (proto.__reactAutoBindMap[key]) {
        proto.__reactAutoBindMap[key] = proto[key];
      }
    }

    function updateStoredPrototype(freshPrototype) {
      storedPrototype = {};

      for (var key in freshPrototype) {
        if (freshPrototype.hasOwnProperty(key)) {
          storedPrototype[key] = freshPrototype[key];
        }
      }
    }

    function reconcileWithStoredPrototypes(freshPrototype) {
      knownPrototypes.push(freshPrototype);
      knownPrototypes.forEach(function (proto) {
        for (var key in storedPrototype) {
          patchProperty(proto, key);
        }
      });
    }

    return function (freshPrototype) {
      updateStoredPrototype(freshPrototype);
      reconcileWithStoredPrototypes(freshPrototype);
    };
  })();

  function injectMixinAndAssimilatePrototype(spec) {
    spec.mixins = spec.mixins || [];
    spec.mixins.push(Mixin);
    var Component = React.createClass(spec);
    assimilatePrototype(Component.type.prototype);
    return Component;
  }

  function forceUpdateTree(instance) {
    if (instance.forceUpdate) {
      instance.forceUpdate();
    }

    if (instance._renderedComponent) {
      forceUpdateTree(instance._renderedComponent);
    }

    for (var key in instance._renderedChildren) {
      forceUpdateTree(instance._renderedChildren[key]);
    }
  }

  var Component;
  return {
    createClass: function (spec) {
      Component = injectMixinAndAssimilatePrototype(spec);
      return Component;
    },

    updateClass: function (spec) {
      injectMixinAndAssimilatePrototype(spec);

      mounted.forEach(function (instance) {
        instance._bindAutoBindMethods();
        forceUpdateTree(instance);
      });

      return Component;
    }
  };
};