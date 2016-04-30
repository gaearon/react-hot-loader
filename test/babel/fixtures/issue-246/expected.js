"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spread = spread;
function spread() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.push(1);
}
;

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

  tagSource(spread, "spread");
})();

;
