"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Foo = function () {
  function Foo() {
    var _this = this;

    _classCallCheck(this, Foo);

    this.bar = function () {
      return _this.__bar__REACT_HOT_LOADER__.apply(_this, arguments);
    };
  }

  _createClass(Foo, [{
    key: "__bar__REACT_HOT_LOADER__",
    value: function __bar__REACT_HOT_LOADER__() {
      var a = arguments.length <= 0 || arguments[0] === undefined ? "foo" : arguments[0];

      return a + "bar";
    }
  }]);

  return Foo;
}();

;

(function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(Foo, "Foo", __FILENAME__);
})();

;
