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

  tagSource(A, "A");
  tagSource(B, "B");
  tagSource(C, "C");
  tagSource(D, "D");
  tagSource(E, "E");
  tagSource(_default, "default");
})();
