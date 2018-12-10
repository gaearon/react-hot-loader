import { REGENERATE_METHOD } from './internal/constants'

const RHLPackage = 'react-hot-loader'

const templateOptions = {
  placeholderPattern: /^([A-Z0-9]+)([A-Z0-9_]+)$/,
}

/* eslint-disable */
const shouldIgnoreFile = file =>
  !!file
    .split('\\')
    .join('/')
    .match(/node_modules\/(react|react-hot-loader)([\/]|$)/)
/* eslint-enable */

module.exports = function plugin(args) {
  // This is a Babel plugin, but the user put it in the Webpack config.
  if (this && this.callback) {
    throw new Error(
      'React Hot Loader: You are erroneously trying to use a Babel plugin ' +
        'as a Webpack loader. We recommend that you use Babel, ' +
        'remove "react-hot-loader/babel" from the "loaders" section ' +
        'of your Webpack configuration, and instead add ' +
        '"react-hot-loader/babel" to the "plugins" section of your .babelrc file. ' +
        'If you prefer not to use Babel, replace "react-hot-loader/babel" with ' +
        '"react-hot-loader/webpack" in the "loaders" section of your Webpack configuration. ',
    )
  }
  const { types: t, template } = args

  // Prevent our own rollup compilation substituting this
  const processEnvNodeEnv = 'process.' + 'env.' + 'NODE_ENV'; // eslint-disable-line no-useless-concat

  const buildRegistration = template(
    'reactHotLoader.register(ID, NAME, FILENAME);',
    templateOptions,
  )
  const headerTemplate = template(
    `
(function () {
  // Allow tree shaking to drop the react-hot-loader module by wrapping with a conditional that DefinePlugin can replace
  // This cannot be a ternary - must be an IF
  if (${processEnvNodeEnv} != 'production') {
    var enterModule = require('react-hot-loader').enterModule;
    enterModule && enterModule(module);
  }
}())
    `,
    templateOptions,
  )
  const evalTemplate = template('this[key]=eval(code);', templateOptions)

  const buildTagger = template(
    `
(function () {
  // Allow tree shaking to drop the react-hot-loader module by wrapping with a conditional that DefinePlugin can replace
  // This cannot be a ternary - must be an IF
  if (${processEnvNodeEnv} != 'production') {
    var reactHotLoader = require('react-hot-loader').default;
    var leaveModule = require('react-hot-loader').leaveModule;

    if (!reactHotLoader) {
      return;
    }

    REGISTRATIONS

    leaveModule(module);
  }
}());
    `,
    templateOptions,
  )

  const hotTemplate = template(
    `
    function(){
      if (${processEnvNodeEnv} == 'production') {
        return ARGUMENTNODE
      } else {
        return HOTNODE
      }
    }()
    `,
    templateOptions
  )

  // Gather top-level variables, functions, and classes.
  // Try our best to avoid variables from require().
  // Ideally we only want to find components defined by the user.
  function shouldRegisterBinding(binding) {
    const { type, node } = binding.path
    switch (type) {
      case 'FunctionDeclaration':
      case 'ClassDeclaration':
      case 'VariableDeclaration':
        return true
      case 'VariableDeclarator': {
        const { init } = node
        if (t.isCallExpression(init) && init.callee.name === 'require') {
          return false
        }
        return true
      }
      default:
        return false
    }
  }

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

  function replaceHotPath(hotPath, argumentNode, hotName) {
    // Prevent recursion - when we replaced we re-added hot() again so do not replace it again
    if (hotPath.node.reactHotLoaderReplaced) {
      return
    }
    hotPath.node.reactHotLoaderReplaced = true
    // Replace the hot call with a conditional expression that UglifyJs 3 will completely remove
    // UglifyJs 2 will collapse it to a simple return
    hotPath.replaceWith(hotTemplate({ ARGUMENTNODE: argumentNode.arguments[0], HOTNODE: hotPath.node}))
  }

  const REGISTRATIONS = Symbol('registrations')
  return {
    pre() {
      // ignore hot replacement in files that do not use RHL
      this.rhlContext = getRHLContext(this.file)
      this.cancelHotReplacement = !this.rhlContext
    },
    visitor: {
      CallExpression(path) {
        if (this.cancelHotReplacement) {
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
              replaceHotPath(path.parentPath, path.parent, specifier.local);
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
              replaceHotPath(path, path.node, specifier.local)
              break
            }
          }
        }
      },

      ExportDefaultDeclaration(path, state) {
        const { file } = state
        // Default exports with names are going
        // to be in scope anyway so no need to bother.
        if (path.node.declaration.id) {
          return
        }

        // Move export default right hand side to a variable
        // so we can later refer to it and tag it with __source.
        const id = path.scope.generateUidIdentifier('default')
        const expression = t.isExpression(path.node.declaration)
          ? path.node.declaration
          : t.toExpression(path.node.declaration)
        path.insertBefore(
          t.variableDeclaration('const', [
            t.variableDeclarator(id, expression),
          ]),
        )
        path.node.declaration = id // eslint-disable-line no-param-reassign

        // It won't appear in scope.bindings
        // so we'll manually remember it exists.
        state[REGISTRATIONS].push(
          buildRegistration({
            ID: id,
            NAME: t.stringLiteral('default'),
            FILENAME: t.stringLiteral(file.opts.filename),
          }),
        )
      },

      Program: {
        enter({ scope }, state) {
          const { file } = state
          state[REGISTRATIONS] = [] // eslint-disable-line no-param-reassign

          // Everything in the top level scope, when reasonable,
          // is going to get tagged with __source.
          /* eslint-disable guard-for-in,no-restricted-syntax */
          for (const id in scope.bindings) {
            const binding = scope.bindings[id]
            if (shouldRegisterBinding(binding)) {
              state[REGISTRATIONS].push(
                buildRegistration({
                  ID: binding.identifier,
                  NAME: t.stringLiteral(id),
                  FILENAME: t.stringLiteral(file.opts.filename),
                }),
              )
            }
          }
          /* eslint-enable */
        },

        exit({ node }, state) {
          const { file } = state
          const registrations = state[REGISTRATIONS]
          state[REGISTRATIONS] = []

          // inject the code only if applicable
          if (
            registrations &&
            registrations.length &&
            !shouldIgnoreFile(file.opts.filename)
          ) {
            node.body.unshift(headerTemplate())
            // Inject the generated tagging code at the very end
            // so that it is as minimally intrusive as possible.
            node.body.push(t.emptyStatement())
            node.body.push(buildTagger({ REGISTRATIONS: registrations }))
            node.body.push(t.emptyStatement())
          }
        },
      },
      Class(classPath) {
        const classBody = classPath.get('body')
        let hasRegenerateMethod = false
        let hasMethods = false

        classBody.get('body').forEach(path => {
          const { node } = path

          // don't apply transform to static class properties
          if (node.static) {
            return
          }

          if (node.key.name !== REGENERATE_METHOD) {
            hasMethods = true
          } else {
            hasRegenerateMethod = true
          }
        })

        if (hasMethods && !hasRegenerateMethod) {
          const regenerateMethod = t.classMethod(
            'method',
            t.identifier(REGENERATE_METHOD),
            [t.identifier('key'), t.identifier('code')],
            t.blockStatement([evalTemplate()]),
          )

          classBody.pushContainer('body', regenerateMethod)

          classBody.get('body').forEach(path => {
            const { node } = path

            if (node.key.name === REGENERATE_METHOD) {
              path.addComment('leading', ' @ts-ignore', true)
              path
                .get('body')
                .get('body')[0]
                .addComment('leading', ' @ts-ignore', true)
            }
          })
        }
      },
    },
  }
}

module.exports.shouldIgnoreFile = shouldIgnoreFile
