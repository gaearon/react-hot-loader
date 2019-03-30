if (module.hot) {
  var hot = require('./index').hot
  var cache = require.cache

  if (!module.parents || !module.parents[0]) {
    throw new Error(
      'React-Hot-Loader: `react-hot-loader/root` is not supported on your system. '+
      'Please use `import {hot} from "react-hot-loader"` instead'
    )
  }
  // access parent
  var parent = cache[module.parents[0]]
  // remove itself from a cache
  delete cache[module.id]
  // setup hot for caller

  exports.hot = hot(Object.assign({ id: parent.i }, parent))
} else {
  // prod mode
  exports.hot = function(a) {
    return a
  }
}
