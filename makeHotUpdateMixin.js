var setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
  /* jshint proto:true */
  obj.__proto__ = proto;
  return obj;
};

module.exports = function () {
  var mounted = [];

  var Mixin = {
    componentDidMount: function () {
      mounted.push(this);
    },

    componentWillUnmount: function () {
      mounted.splice(mounted.indexOf(this), 1);
    }
  };

  function forceUpdates() {
    mounted.forEach(function (instance) {
      instance.forceUpdate();
    });
  }

  function acceptUpdate(FreshComponent) {
    var freshProto = FreshComponent.componentConstructor.prototype;

    mounted.forEach(function (instance) {
      setPrototypeOf(instance, freshProto);
      instance.constructor.prototype = freshProto;
      instance._bindAutoBindMethods();
    });

    window.setTimeout(forceUpdates, 0);
  }

  return {
    Mixin: Mixin,
    acceptUpdate: acceptUpdate
  };
};