import makeProxy from './makeProxy';

export default function makeHotify() {
  const proxyTo = makeProxy({});
  let CurrentClass = null;

  function HotClass() {
    CurrentClass.apply(this, arguments);
  }

  return function (NextClass) {
    CurrentClass = NextClass;

    // Wow, this is dense!
    // I have no idea what's going on here, but it works.

    HotClass.prototype = proxyTo(NextClass.prototype);
    HotClass.prototype.__proto__ = NextClass.prototype;
    HotClass.prototype.constructor = HotClass;
    HotClass.prototype.constructor.__proto__ = NextClass;

    return HotClass;
  };
}