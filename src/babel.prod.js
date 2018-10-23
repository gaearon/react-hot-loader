const RHLPackage = 'react-hot-loader'

function isImportFromRHL(path, name) {
  const binding = path.scope.getBinding(name)
  const bindingType = binding && binding.path.node.type

  if (
    bindingType === 'ImportSpecifier' ||
    bindingType === 'ImportDefaultSpecifier' ||
    bindingType === 'ImportNamespaceSpecifier'
  ) {
    const bindingParent = binding.path.parent
    return bindingParent.source.value === RHLPackage
  }

  return false
}

function isRHLContext(file) {
  const { modules } = file.metadata

  if (modules && Array.isArray(modules.imports)) {
    const { imports } = modules

    for (let i = 0; i < imports.length; i++) {
      const { source } = imports[i]

      if (source === RHLPackage) {
        return true
      }
    }
  }

  return false
}

export default function plugin() {
  function handleCall(path) {
    if (!this.cancel) {
      if (
        path.node.callee.name === 'hot' &&
        // ensure that this is `hot` from RHL
        isImportFromRHL(path, 'hot') &&
        path.parent.type === 'CallExpression' &&
        path.parent.arguments[0] &&
        path.parent.arguments[0].type === 'Identifier'
      ) {
        path.parentPath.replaceWith(path.parent.arguments[0])
      }
    }
  }

  return {
    pre() {
      // ignore files that do not use RHL
      if (!isRHLContext(this.file)) {
        this.cancel = true
      }
    },
    visitor: {
      CallExpression: handleCall,
    },
  }
}
