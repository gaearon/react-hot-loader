class Foo {
  bar = (a, b) => {
    () => {
      new.target;
    };

    return a(b);
  };
}
;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(Foo, "Foo", __FILENAME__);
}();

;
