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

  return {
    createClass: function (spec) {
      spec.mixins = spec.mixins || [];
      spec.mixins.push(Mixin);
      return React.createClass(spec);
    },

    updateClass: function (spec) {
      var Component = React.createClass(spec);
      var newProto = Component.componentConstructor.prototype;

      mounted.forEach(function (instance) {
        setPrototypeOf(instance, newProto);
        instance.constructor.prototype = newProto;
        instance._bindAutoBindMethods();
        instance.forceUpdate();
      });

      return Component;
    }
  };
};