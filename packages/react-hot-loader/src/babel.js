import { REGENERATE_METHOD } from './internal/constants'

const templateOptions = {
  placeholderPattern: /^([A-Z0-9]+)([A-Z0-9_]+)$/,
}

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
       var enterModule = require('react-hot-loader/patch').enterModule;
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
  var reactHotLoader = require('react-hot-loader/patch').default;
  var leaveModule = require('react-hot-loader/patch').leaveModule;

  if (!reactHotLoader) {
    return;
  }

  REGISTRATIONS

  leaveModule(module);
}());
  `,
    templateOptions,
  )

  // No-op in production.
  if (process.env.NODE_ENV === 'production') {
    return { visitor: {} }
  }

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

  const REGISTRATIONS = Symbol('registrations')
  return {
    visitor: {
      ExportDefaultDeclaration(path, { file }) {
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
        path.parent[REGISTRATIONS].push(
          buildRegistration({
            ID: id,
            NAME: t.stringLiteral('default'),
            FILENAME: t.stringLiteral(file.opts.filename),
          }),
        )
      },

      Program: {
        enter({ node, scope }, { file }) {
          node[REGISTRATIONS] = [] // eslint-disable-line no-param-reassign

          // Everything in the top level scope, when reasonable,
          // is going to get tagged with __source.
          /* eslint-disable guard-for-in,no-restricted-syntax */
          for (const id in scope.bindings) {
            const binding = scope.bindings[id]
            if (shouldRegisterBinding(binding)) {
              node[REGISTRATIONS].push(
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

        exit({ node }) {
          const registrations = node[REGISTRATIONS]
          node[REGISTRATIONS] = null // eslint-disable-line no-param-reassign

          // inject the code only if applicable
          if (registrations.length) {
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
        }
      },
    },
  }
}
