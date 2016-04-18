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

(function () {
  function tagSource(fn, localName) {
    if (typeof fn !== "function") {
      return;
    }

    if (fn.hasOwnProperty("__source")) {
      return;
    }

    try {
      Object.defineProperty(fn, "__source", {
        enumerable: false,
        configurable: true,
        value: {
          fileName: __FILENAME__,
          localName: localName
        }
      });
    } catch (err) {}
  }

  tagSource(Counter, "Counter");
  tagSource(_default, "default");
})();