var isReactClassish = require('./isReactClassish');

function isReactElementish(obj) {
  if (!obj) {
    return false;
  }

  return isReactClassish(obj.type) &&
         Object.prototype.toString.call(obj.props) === '[object Object]';
}

module.exports = isReactElementish;