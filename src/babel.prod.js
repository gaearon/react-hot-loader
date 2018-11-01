const RHLPackage = 'react-hot-loader'

function isImportedFromRHL(path, name) {
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

function getRHLContext(file) {
  const context = []
  const imports = []
  const { body } = file.ast.program

  for (let i = 0; i < body.length; i++) {
    const bodyItem = body[i]

    if (bodyItem.type === 'ImportDeclaration') {
      const { source, specifiers } = bodyItem

      if (source.value !== RHLPackage) {
        continue
      }

      const importData = { source: source.value, specifiers: [] }

      for (let j = 0; j < specifiers.length; j++) {
        const specifier = specifiers[j]

        if (specifier.type === 'ImportNamespaceSpecifier') {
          importData.specifiers.push({
            kind: 'namespace',
            local: specifier.local.name,
          })
        } else if (
          specifier.type === 'ImportSpecifier' ||
          specifier.type === 'ImportDefaultSpecifier'
        ) {
          importData.specifiers.push({
            kind: 'named',
            local: specifier.local.name,
            imported: specifier.imported
              ? specifier.imported.name
              : specifier.local.name,
          })
        }
      }

      if (importData.specifiers.length) {
        imports.push(importData)
      }
    }
  }

  for (let i = 0; i < imports.length; i++) {
    const { source, specifiers } = imports[i]

    if (source === RHLPackage) {
      for (let j = 0; j < specifiers.length; j++) {
        const specifier = specifiers[j]

        if (
          (specifier.kind === 'named' && specifier.imported === 'hot') ||
          specifier.kind === 'namespace'
        ) {
          context.push(specifier)
        }
      }
    }
  }

  return context.length ? context : null
}

export default function plugin() {
  function handleCall(path) {
    if (!this.cancel) {
      for (let i = 0; i < this.rhlContext.length; i++) {
        const specifier = this.rhlContext[i]

        if (specifier.kind === 'named') {
          if (
            path.node.callee.name === specifier.local &&
            // ensure that this is `hot` from RHL
            isImportedFromRHL(path, specifier.local) &&
            path.parent.type === 'CallExpression' &&
            path.parent.arguments[0] &&
            path.parent.arguments[0].type === 'Identifier'
          ) {
            path.parentPath.replaceWith(path.parent.arguments[0])
            break
          }
        } else if (specifier.kind === 'namespace') {
          if (
            path.node.callee.callee &&
            path.node.callee.callee.type === 'MemberExpression' &&
            path.node.callee.callee.object.type === 'Identifier' &&
            path.node.callee.callee.object.name === specifier.local &&
            // ensure that this is from RHL
            isImportedFromRHL(path, specifier.local) &&
            path.node.callee.callee.property.type === 'Identifier' &&
            path.node.callee.callee.property.name === 'hot' &&
            path.node.arguments[0] &&
            path.node.arguments[0].type === 'Identifier'
          ) {
            path.replaceWith(path.node.arguments[0])
            break
          }
        }
      }
    }
  }

  return {
    pre() {
      // ignore files that do not use RHL
      this.rhlContext = getRHLContext(this.file)

      if (!this.rhlContext) {
        this.cancel = true
      }
    },
    visitor: {
      CallExpression: handleCall,
    },
  }
}
