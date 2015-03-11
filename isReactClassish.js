function hasRender(Class) {
  var prototype = Class.prototype;
  if (!prototype) {
    return false;
  }

  return typeof prototype.render === 'function';
}

function descendsFromReactComponent(Class, React) {
  if (!React.Component) {
    return false;
  }

  var Base = Object.getPrototypeOf(Class);
  while (Base) {
    if (Base === React.Component) {
      return true;
    }

    Base = Object.getPrototypeOf(Base);
  }

  return false;
}

function isReactClassish(Class, React) {
  if (typeof Class !== 'function') {
    return false;
  }

  // React 0.13
  if (hasRender(Class) || descendsFromReactComponent(Class, React)) {
    return true;
  }

  // React 0.12 and earlier
  if (Class.type && hasRender(Class.type)) {
    return true;
  }

  return false;
}

module.exports = isReactClassish;