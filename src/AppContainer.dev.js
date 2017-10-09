const React = require('react')
const HotContainer = require('./HotContainer.dev')

class AppContainer extends React.Component {
  componentWillMount() {
    console.error(
      'React Hot Loader: AppContainer is deprecated and will be removed in v5. ' +
    'Please use HotContainer instead.')
  }

  render() {
    return <HotContainer {...this.props} />
  }
}

module.exports = AppContainer
