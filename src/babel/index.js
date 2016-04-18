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

export default function({ types: t, template }) {
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
