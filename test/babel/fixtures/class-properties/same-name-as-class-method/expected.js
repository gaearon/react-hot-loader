var _this = this;

class Foo {
  bar = (...params) => _this.__bar__REACT_HOT_LOADER__(...params);

  __bar__REACT_HOT_LOADER__(a, b) {
    return a(b);
  }

  bar() {
    return 2;
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
