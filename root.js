if (module.hot) {
  const { hot: root } = require('./index')
  const cache = require.cache

  // access parent
  const parent = cache[module.parents[0]]
  // remove itself from a cache
  delete cache[module.id]
  // setup hot for caller

  exports.hot = root(Object.assign({ id: parent.i }, parent))
} else {
  // prod mode
  exports.hot = function(a) {
    return a
  }
}
