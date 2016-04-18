const React = require('react');
const deepForceUpdate = require('react-deep-force-update');
const Redbox = require('redbox-react');
const { Component } = React;

let wasCreateElementPatched = false;
const A = () => {};
A.__source = { fileName: 'fake', localName: 'fake' }
const B = () => {};
B.__source = { fileName: 'fake', localName: 'fake' }
if (<A />.type === <B />.type) {
  wasCreateElementPatched = true;
}

class AppContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentDidMount() {
    if (!wasCreateElementPatched) {
      console.error(
        'React Hot Loader: It appears that "react-hot-loader/patch" ' +
        'did not run immediately before the app started. Make sure that it ' +
        'runs before any other code. For example, if you use Webpack, ' +
        'you can add "react-hot-loader/patch" as the very first item to the ' +
        '"entry" array in its config. Alternatively, you can add ' +
        'require("react-hot-loader/patch") as the very first line ' +
        'in the application code, before any other imports.'
      );
    }
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
