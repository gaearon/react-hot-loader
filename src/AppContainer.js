const React = require('react');
const deepForceUpdate = require('react-deep-force-update');
const Redbox = require('redbox-react');
const { Component } = React;

class AppContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.component !== this.props.component) {
      this.setState({
        error: null
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.component !== this.props.component) {
      deepForceUpdate(this);
    }
  }

  unstable_handleError(error) {
    this.setState({
      error: error
    });
  }

  render() {
    const { error } = this.state;
    if (error) {
      return <this.props.errorReporter error={error} />;
    } else {
      return <this.props.component />;
    }
  }
}

AppContainer.defaultProps = {
  errorReporter: Redbox
};

module.exports = AppContainer;
