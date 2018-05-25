import configuration from '../configuration'

const tune = {
  allowSFC: false,
}

export const preactAdapter = (instance, resolveType) => {
  const oldHandler = instance.options.vnode

  Object.assign(configuration, tune)

  instance.options.vnode = vnode => {
    vnode.nodeName = resolveType(vnode.nodeName)
    if (oldHandler) {
      oldHandler(vnode)
    }
  }
}
