const RHLPackage = 'react-hot-loader'

function isImportedFromRHL(path, name) {
  const binding = path.scope.getBinding(name)
  const bindingType = binding && binding.path.node.type

  if (
    bindingType === 'ImportSpecifier' ||
    bindingType === 'ImportNamespaceSpecifier'
  ) {
    const bindingParent = binding.path.parent
    return bindingParent.source.value === RHLPackage
  }

  return false
}

function getRHLContext(file) {
  const context = []
  const { body } = file.ast.program

  for (let i = 0; i < body.length; i++) {
    const bodyItem = body[i]
    const { source, specifiers } = bodyItem

    if (bodyItem.type !== 'ImportDeclaration' || source.value !== RHLPackage) {
      continue
    }

    for (let j = 0; j < specifiers.length; j++) {
      const specifier = specifiers[j]

      if (specifier.type === 'ImportNamespaceSpecifier') {
        context.push({
          kind: 'namespace',
          local: specifier.local.name,
        })
      } else if (specifier.type === 'ImportSpecifier') {
        const specifierData = {
          kind: 'named',
          local: specifier.local.name,
        }

        if (specifier.imported.name === 'hot') {
          context.push(specifierData)
        }
      }
    }
  }

  return context.length ? context : null
}

export default function plugin() {
  function handleCall(path) {
    if (this.cancel) {
      return
    }

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
