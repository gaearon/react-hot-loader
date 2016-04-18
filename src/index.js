const AppContainer = require('./AppContainer');

module.exports = function warnAboutIncorrectUsage(arg) {
  if (this && this.callback) {
    throw new Error(
      'React Hot Loader is now more than a Webpack loader. ' +
      'Replace "react-hot-loader" or "react-hot" with "react-hot-loader/webpack" ' +
      'in the "loaders" section of your Webpack configuration. ' +
      'Alternatively, if you use Babel, we recommend that you remove ' +
      '"react-hot-loader" from the "loaders" section altogether, and ' +
      'instead add "react-hot-loader/babel" to the "plugins" section of ' +
      'your .babelrc file.'
    );
  } else if (arg && arg.types && arg.types.IfStatement) {
    throw new Error(
      'React Hot Loader is more than a Babel plugin. ' +
      'Replace "react-hot-loader" with "react-hot-loader/babel" ' +
      'in the "plugins" section of your .babelrc file. ' +
      'Alternatively, if you’d rather not use Babel for some reason, ' +
      'you may remove "react-hot-loader" from the "plugins" section ' +
      'altogether, and instead add "react-hot-loader/webpack" to the ' +
      '"loaders" section of your Webpack configuration.'
    );
  } else {
    throw new Error(
      'React Hot Loader does not have a default export. ' +
      'If you use the import statement, make sure to include the ' +
      'curly braces: import { AppContainer } from "react-hot-loader". ' +
      'If you use CommonJS, make sure to read the named export: ' +
      'require("react-hot-loader").AppContainer.'
    );
  }
}

module.exports.AppContainer = AppContainer;
