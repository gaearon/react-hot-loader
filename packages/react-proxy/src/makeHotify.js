import makeAssimilatePrototype from './makeAssimilatePrototype';

export default function makeHotify() {
  const assimilatePrototype = makeAssimilatePrototype();
  let CurrentClass = null;

  function HotClass() {
    CurrentClass.apply(this, arguments);
  }

  return function (NextClass) {
    CurrentClass = NextClass;
    HotClass.prototype = assimilatePrototype(NextClass.prototype);

    return HotClass;
  };
}