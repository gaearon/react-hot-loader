var isReactClassish = require('./isReactClassish');

function isReactElementish(obj) {
  if (!obj) {
    return false;
  }

  return Object.prototype.toString.call(obj.props) === '[object Object]' &&
         isReactClassish(obj.type);
}

module.exports = isReactElementish;