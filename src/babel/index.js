import template from 'babel-template';

const buildRegistration = template('tagSource(ID, NAME);');
const buildSemi = template(';');
const buildTagger = template(`
(function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  var fileName = FILENAME;
  function tagSource(fn, localName) {
    if (typeof fn !== "function") {
      return;
    }

    var id = fileName + '#' + localName;
    __REACT_HOT_LOADER__.register(id, fn);
  }
  REGISTRATIONS
})();
`);

module.exports = function(args) {
  // This is a Babel plugin, but the user put it in the Webpack config.
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

  // No-op in production.
  if (process.env.NODE_ENV === 'production') {
    return { visitor: {} };
  }

  // Gather top-level variables, functions, and classes.
  // Try our best to avoid variables from require().
  // Ideally we only want to find components defined by the user.
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
        // Default exports with names are going
        // to be in scope anyway so no need to bother.
        if (path.node.declaration.id) {
          return;
        }

        // Move export default right hand side to a variable
        // so we can later refer to it and tag it with __source.
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

        // It won't appear in scope.bindings
        // so we'll manually remember it exists.
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

          // Everything in the top level scope, when reasonable,
          // is going to get tagged with __source.
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

          // Inject the generated tagging code at the very end
          // so that it is as minimally intrusive as possible.
          node.body.push(buildSemi());
          node.body.push(
            buildTagger({
              FILENAME: t.stringLiteral(file.opts.filename),
              REGISTRATIONS: registrations
            })
          );
          node.body.push(buildSemi());
        }
      }
    }
  };
}
