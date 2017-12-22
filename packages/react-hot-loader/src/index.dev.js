import AppContainer from './AppContainer'
import { hot, areComponentsEqual } from './utils.dev'

export { AppContainer, hot, areComponentsEqual }

export default function warnAboutIncorrectUsage(arg) {
  if (this && this.callback) {
    throw new Error(
      'React Hot Loader: The Webpack loader is now exported separately. ' +
        'If you use Babel, we recommend that you remove "react-hot-loader" ' +
        'from the "loaders" section of your Webpack configuration altogether, ' +
        'and instead add "react-hot-loader/babel" to the "plugins" section ' +
        'of your .babelrc file. ' +
        'If you prefer not to use Babel, replace "react-hot-loader" or ' +
        '"react-hot" with "react-hot-loader/webpack" in the "loaders" section ' +
        'of your Webpack configuration.',
    )
  } else if (arg && arg.types && arg.types.IfStatement) {
    throw new Error(
      'React Hot Loader: The Babel plugin is exported separately. ' +
        'Replace "react-hot-loader" with "react-hot-loader/babel" ' +
        'in the "plugins" section of your .babelrc file. ' +
        'While we recommend the above, if you prefer not to use Babel, ' +
        'you may remove "react-hot-loader" from the "plugins" section of ' +
        'your .babelrc file altogether, and instead add ' +
        '"react-hot-loader/webpack" to the "loaders" section of your Webpack ' +
        'configuration.',
    )
  } else {
    throw new Error(
      'React Hot Loader does not have a default export. ' +
        'If you use the import statement, make sure to include the ' +
        'curly braces: import { AppContainer } from "react-hot-loader". ' +
        'If you use CommonJS, make sure to read the named export: ' +
        'require("react-hot-loader").AppContainer.',
    )
  }
}
