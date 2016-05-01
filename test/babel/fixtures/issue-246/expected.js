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

  tagSource(spread, "spread");
})();

;
