const AppContainer = require('./AppContainer');

module.exports = function warnAboutIncorrectUsage() {
  if (this && this.callback) {
    throw new Error(
      'React Hot Loader is now more than a Webpack loader. ' +
      'Make sure that in your Webpack "loaders" configuration ' +
      'you use "react-hot-loader/webpack" rather than just ' +
      '"react-hot-loader". Alternatively, if you already use Babel, ' +
      'you may remove it from "loaders" completely, and instead add ' +
      '"react-hot-loader/babel" to "plugins" in your .babelrc.'
    );
  } else {
    throw new Error(
      'React Hot Loader does not have a default export. ' +
      'If you use the import statement, make sure to include ' +
      'curly braces: import { AppContainer } from "react-hot-loader". ' +
      'If you use CommonJS, make sure to read the named export: ' +
      'require("react-hot-loader").AppContainer.'
    );
  }
}

module.exports.AppContainer = AppContainer;
