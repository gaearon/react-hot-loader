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

(function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  var fileName = __FILENAME__;

  function tagSource(fn, localName) {
    if (typeof fn !== "function") {
      return;
    }

    var id = fileName + '#' + localName;

    __REACT_HOT_LOADER__.register(id, fn);
  }

  tagSource(Counter, "Counter");
  tagSource(_default, "default");
})();

;
