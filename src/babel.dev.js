import { REGENERATE_METHOD } from './internal/constants'

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

  const buildRegistration = template(
    'reactHotLoader.register(ID, NAME, FILENAME);',
    templateOptions,
  )
  const headerTemplate = template(
    `(function () {
       var enterModule = require('react-hot-loader').enterModule;
       enterModule && enterModule(module);
     }())`,
    templateOptions,
  )
  const evalTemplate = template('this[key]=eval(code);', templateOptions)

  // We're making the IIFE we insert at the end of the file an unused variable
  // because it otherwise breaks the output of the babel-node REPL (#359).
  const buildTagger = template(
    `
(function () {
  var reactHotLoader = require('react-hot-loader').default;
  var leaveModule = require('react-hot-loader').leaveModule;

  if (!reactHotLoader) {
    return;
  }

  REGISTRATIONS

  leaveModule(module);
}());
  `,
    templateOptions,
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

  return {
    visitor: {
      // using program to replace imports before "dynamic-import-node"
      // see: https://jamie.build/babel-plugin-ordering.html
      Program: {
        enter(programPath, { file }) {
          const registrations = []
          const { scope, node } = programPath

          /* eslint-disable guard-for-in,no-restricted-syntax */
          for (const id in scope.bindings) {
            const binding = scope.bindings[id]
            if (shouldRegisterBinding(binding)) {
              registrations.push(
                buildRegistration({
                  ID: binding.identifier,
                  NAME: t.stringLiteral(id),
                  FILENAME: t.stringLiteral(file.opts.filename),
                }),
              )
            }
          }
          /* eslint-enable */

          programPath.traverse({
            ExportDefaultDeclaration(path) {
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
              registrations.push(
                buildRegistration({
                  ID: id,
                  NAME: t.stringLiteral('default'),
                  FILENAME: t.stringLiteral(file.opts.filename),
                }),
              )
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
          })

          if (registrations.length && !shouldIgnoreFile(file.opts.filename)) {
            node.body.unshift(headerTemplate())
            // Inject the generated tagging code at the very end
            // so that it is as minimally intrusive as possible.
            node.body.push(t.emptyStatement())
            node.body.push(buildTagger({ REGISTRATIONS: registrations }))
            node.body.push(t.emptyStatement())
          }
        },
      },
    },
  }
}

module.exports.shouldIgnoreFile = shouldIgnoreFile
