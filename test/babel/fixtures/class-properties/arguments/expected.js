var _arguments = arguments;
class Foo {
  bar = (a, b) => {
    _arguments;

    return a(b);
  };
}
;

(function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(Foo, "Foo", __FILENAME__);
})();

;
