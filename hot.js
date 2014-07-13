'use strict';

var _ = require('underscore');
var setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
  /* jshint proto:true */
  obj.__proto__ = proto;
  return obj;
};

var coalesce = (function () {
  var queue = [],
      processQueue;

  processQueue = _.debounce(function () {
    while (queue.length) {
      queue.pop().call();
    }
  }, 0);

  return function(f) {
    queue.push(f);
    processQueue();
  };
})();

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
      var freshProto = React.createClass(spec).componentConstructor.prototype;

      mounted.forEach(function (instance) {
        setPrototypeOf(instance, freshProto);
        instance.constructor.prototype = freshProto;
        instance._bindAutoBindMethods();
        coalesce(instance.forceUpdate);
      });
    }
  };
};