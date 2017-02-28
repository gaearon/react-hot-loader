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

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(spread, "spread", __FILENAME__);
}();

;
