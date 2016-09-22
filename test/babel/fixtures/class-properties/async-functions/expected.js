var _this = this;

class Foo {
  bar = async (...params) => await _this.__bar__REACT_HOT_LOADER__(...params);

  async __bar__REACT_HOT_LOADER__(a, b) {
    return await a(b);
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
