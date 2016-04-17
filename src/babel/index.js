export default function({ types: t, template }) {
  function hasParentFunction(path) {
    return !!path.findParent(parentPath => parentPath.isFunction());
  }

  return {
    visitor: { }
  };
}
