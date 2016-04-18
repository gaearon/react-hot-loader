import template from 'babel-template';

const buildRegistration = template(`
  tagSource(ID, NAME);
`);
const buildTagger = template(`
(function () {
  function tagSource(fn, localName) {
    if (typeof fn !== "function") {
      return;
    }

    if (fn.hasOwnProperty("__source")) {
      return;
    }

    try {
      Object.defineProperty(fn, "__source", {
        enumerable: false,
        configurable: true,
        value: {
          fileName: FILENAME,
          localName: localName
        }
      });
    } catch (err) {}
  }
  REGISTRATIONS
})();
`);

module.exports = function(args) {
  if (this && this.callback) {
    throw new Error(
      'React Hot Loader: You are erroneously trying to use a Babel plugin ' +
      'as a Webpack loader. Replace "react-hot-loader/babel" with ' +
      '"react-hot-loader/webpack" in the "loaders" section of your Webpack ' +
      'configuration. Alternatively, if you use Babel, we recommend that you ' +
      'remove "react-hot-loader/babel" from the "loaders" section ' +
      'altogether, and instead add "react-hot-loader/babel" to the "plugins" ' +
      'section of your .babelrc file.'
    );
  }
  const { types: t } = args;

  if (process.env.NODE_ENV === 'production') {
    return { visitor: {} };
  }

  function shouldRegisterBinding(binding) {
    let { type, node } = binding.path;
    switch (type) {
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
    case 'VariableDeclaration':
      return true;
    case 'VariableDeclarator':
      const { init } = node;
      if (t.isCallExpression(init) && init.callee.name === 'require') {
        return false;
      }
      return true;
    default:
      return false;
    }
  }

  const DEFAULT_EXPORT = Symbol();
  return {
    visitor: {
      ExportDefaultDeclaration(path)  {
        if (path.node.declaration.id) {
          return;
        }

        const id = path.scope.generateUidIdentifier('default');
        const expression = t.isExpression(path.node.declaration) ?
          path.node.declaration :
          t.toExpression(path.node.declaration);

        path.insertBefore(
          t.variableDeclaration('const', [
            t.variableDeclarator(id, expression)
          ])
        )
        path.node.declaration = id;
        path.parent[DEFAULT_EXPORT] = id;
      },

      Program: {
        enter({ node }) {
          node[DEFAULT_EXPORT] = null;
        },

        exit({ node, scope }, { file }) {
          let registrations = [];

          for (let id in scope.bindings) {
            const binding = scope.bindings[id];
            if (shouldRegisterBinding(binding)) {
              registrations.push(buildRegistration({
                ID: binding.identifier,
                NAME: t.stringLiteral(id)
              }));
            }
          }

          if (node[DEFAULT_EXPORT]) {
            registrations.push(buildRegistration({
              ID: node[DEFAULT_EXPORT],
              NAME: t.stringLiteral('default')
            }));
          }

          node.body.push(
            buildTagger({
              FILENAME: t.stringLiteral(file.opts.filename),
              REGISTRATIONS: registrations
            })
          )
        }
      }
    }
  };
}
