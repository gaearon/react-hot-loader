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

  var OriginalComponent;

  return {
    createClass: function (spec) {
      spec.mixins = spec.mixins || [];
      spec.mixins.push(Mixin);
      OriginalComponent = React.createClass(spec);
      return OriginalComponent;
    },

    updateClass: function (spec) {
      var FreshComponent = React.createClass(spec),
          oldProto = OriginalComponent.componentConstructor.prototype,
          newProto = FreshComponent.componentConstructor.prototype;

      mounted.forEach(function (instance) {
        setPrototypeOf(instance, newProto);
        instance.constructor.prototype = newProto;
        instance._bindAutoBindMethods();
        instance.forceUpdate();
      });

      var key;
      for (key in oldProto) {
        if (!newProto.hasOwnProperty(key)) {
          delete oldProto[key];
        }
      }
      for (key in newProto) {
        oldProto[key] = newProto[key];
      }

      return OriginalComponent;
    }
  };
};