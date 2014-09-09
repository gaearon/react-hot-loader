'use strict';

/**
 * Provides `createClass` and `updateClass` which can be used to create and
 * later patch a single component with a new version of itself.
 */
module.exports = function (React) {
  var mounted = [];

  /**
   * Keeps track of mounted instances.
   */
  var TrackInstancesMixin = {
    componentDidMount: function () {
      mounted.push(this);
    },

    componentWillUnmount: function () {
      mounted.splice(mounted.indexOf(this), 1);
    }
  };


  /**
   * Establishes a prototype as the "source of truth" and updates its methods on
   * subsequent invocations, also patching fresh prototypes to pass calls to it.
   */
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


  /**
   * Mixes instance tracking into the spec, lets React produce a fresh version
   * of the component and assimilates its changes into the old version.
   */
  function injectMixinAndAssimilatePrototype(spec) {
    spec.mixins = spec.mixins || [];
    spec.mixins.push(TrackInstancesMixin);
    var Component = (React.createClass)(spec);
    assimilatePrototype(Component.type.prototype);
    return Component;
  }


  /**
   * Updates a React component recursively, so even if children define funky
   * `shouldComponentUpdate`, they are forced to re-render.
   */
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

  /**
   * Proxies React.createClass to enable hot updates.
   */
  function createClass(spec) {
    if (Component) {
      throw new Error('createClass may only be called once for a given updater.');
    }

    Component = injectMixinAndAssimilatePrototype(spec);
    return Component;
  }

  /**
   * Proxies React.createClass to apply hot update.
   */
  function updateClass(spec) {
    if (!Component) {
      throw new Error('updateClass may only be called after createClass.');
    }

    injectMixinAndAssimilatePrototype(spec);
    return Component;
  }

  /**
   * Re-binds methods of mounted instances and re-renders them.
   */
  function updateMountedInstances() {
    mounted.forEach(function (instance) {
      instance._bindAutoBindMethods();
      forceUpdateTree(instance);
    });
  }

  return {
    createClass: createClass,
    updateClass: updateClass,
    updateMountedInstances: updateMountedInstances
  };
};
