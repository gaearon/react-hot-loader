import P, { Q } from "left-pad";
const A = 42;
function B() {
  function R() {}
  class S {}
  const T = 42;
}
export class C {
  U() {
    function V() {
      class W {}
    }
  }
}
const D = class X {};
let E = D;
var Y = require("left-pad");
var { Z } = require("left-pad");

const _default = React.createClass({});

export default _default;
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

  tagSource(A, "A");
  tagSource(B, "B");
  tagSource(C, "C");
  tagSource(D, "D");
  tagSource(E, "E");
  tagSource(_default, "default");
})();

;
