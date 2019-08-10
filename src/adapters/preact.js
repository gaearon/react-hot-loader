import { setConfiguration } from '../configuration';

const tune = {
  allowSFC: false,
};

export const preactAdapter = (instance, resolveType) => {
  const oldHandler = instance.options.vnode;

  setConfiguration(tune);

  instance.options.vnode = vnode => {
    if (vnode.type) {
      vnode.type = resolveType(vnode.type);
    } else if (vnode.nodeName) {
      vnode.nodeName = resolveType(vnode.nodeName);
    }
    if (oldHandler) {
      oldHandler(vnode);
    }
  };
};
