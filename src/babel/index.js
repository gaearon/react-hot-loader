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
      'as a Webpack loader. We recommend that you use Babel, ' +
      'remove "react-hot-loader/babel" from the "loaders" section ' +
      'of your Webpack configuration, and instead add ' +
      '"react-hot-loader/babel" to the "plugins" section of your .babelrc file. ' +
      'If you prefer not to use Babel, replace "react-hot-loader/babel" with ' +
      '"react-hot-loader/webpack" in the "loaders" section of your Webpack configuration. '
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

  const REGISTRATIONS = Symbol();
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
        path.parent[REGISTRATIONS].push(
          buildRegistration({
            ID: id,
            NAME: t.stringLiteral('default')
          })
        );
      },

      Program: {
        enter({ node, scope }) {
          node[REGISTRATIONS] = [];
          for (let id in scope.bindings) {
            const binding = scope.bindings[id];
            if (shouldRegisterBinding(binding)) {
              node[REGISTRATIONS].push(buildRegistration({
                ID: binding.identifier,
                NAME: t.stringLiteral(id)
              }));
            }
          }
        },

        exit({ node, scope }, { file }) {
          let registrations = node[REGISTRATIONS];
          node[REGISTRATIONS] = null;
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
