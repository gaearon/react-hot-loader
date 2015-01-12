function isReactClassish(obj) {
  if (!obj) {
    return false;
  }

  var prototype = (obj.type || obj).prototype;
  return prototype && typeof prototype.render === 'function' || false;
}

module.exports = isReactClassish;