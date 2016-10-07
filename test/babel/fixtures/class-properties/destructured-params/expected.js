class Foo {
  constructor() {
    this.bar = (...params) => this.__bar__REACT_HOT_LOADER__(...params);
  }

  __bar__REACT_HOT_LOADER__({ a }, { b }) {
    return `${ a }${ b }`;
  }

}
;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(Foo, "Foo", __FILENAME__);
}();

;
