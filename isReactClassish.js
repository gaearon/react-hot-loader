function isReactClassish(obj) {
  if (!obj) {
    return false;
  }

  if (obj.prototype && typeof obj.prototype.render === 'function') {
    // React 0.13
    return true;
  }

  if (obj.type && obj.type.prototype && typeof obj.type.prototype.render === 'function') {
    // React 0.12 and earlier
    return true;
  }

  return false;
}

module.exports = isReactClassish;