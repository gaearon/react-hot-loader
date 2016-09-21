"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Counter = function Counter() {
  _classCallCheck(this, Counter);
};

var _default = function _default() {
  return React.createElement(
    "div",
    null,
    React.createElement(Counter, null)
  );
};

exports.default = _default;
;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(Counter, "Counter", __FILENAME__);

  __REACT_HOT_LOADER__.register(_default, "default", __FILENAME__);
}();

;
