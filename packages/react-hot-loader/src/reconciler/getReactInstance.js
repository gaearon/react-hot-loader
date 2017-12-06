const getReactInstance = instance =>
  instance._reactInternalFiber || instance._reactInternalInstance
export default getReactInstance
