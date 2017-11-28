
// This was originally a WeakMap but we had issues with React Native:
// https://github.com/gaearon/react-proxy/issues/50#issuecomment-192928066
let allProxies = [];
function findProxy(Component) {
  const pair = allProxies.find(([key]) => key === Component);
  return pair ? pair[1] : null;
}
function addProxy(Component, proxy) {
  allProxies.push([Component, proxy]);
}

export {
  findProxy,
  addProxy
}