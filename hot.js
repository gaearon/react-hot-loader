'use strict';

var setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
  /* jshint proto:true */
  obj.__proto__ = proto;
  return obj;
};

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
    var storedPrototype;

    function assimilateProperty(freshPrototype, key) {
      function get() {
        if (typeof storedPrototype[key] !== 'function' ||
          key === 'type' ||
          key === 'constructor') {

          return storedPrototype[key];
        }

        return function () {
          var value = storedPrototype[key];
          if (typeof value === 'function') {
            return value.apply(this, arguments);
          } else {
            console.warn('A call to ' + key + ' was made after it was deleted. Acting as no-op.');
          }
        };
      }

      function set(value) {
        storedPrototype[key] = value;
      }

      storedPrototype[key] = freshPrototype[key];
      Object.defineProperty(freshPrototype, key, {
        configurable: false,
        enumerable: true,
        get: get,
        set: set
      });
    }

    return function assimilatePrototype(freshPrototype) {
      storedPrototype = {};
      for (var key in freshPrototype) {
        assimilateProperty(freshPrototype, key);
      }
    };
  })();

  var Component;
  return {
    createClass: function (spec) {
      spec.mixins = spec.mixins || [];
      spec.mixins.push(Mixin);

      Component = React.createClass(spec);
      assimilatePrototype(Component.componentConstructor.prototype);

      return Component;
    },

    updateClass: function (spec) {
      var UpdatedComponent = React.createClass(spec);
      assimilatePrototype(UpdatedComponent.componentConstructor.prototype);

      mounted.forEach(function (instance) {
        instance._bindAutoBindMethods();
        instance.forceUpdate();
      });

      return Component;
    }
  };
};