var React = require('react');
var deepForceUpdate = require('react-deep-force-update');

var AppContainer = React.createClass({
  getDefaultProps: function() {
    return {
      errorReporter: require('redbox-react')
    };
  },

  getInitialState: function() {
    return {
      error: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.component !== this.props.component) {
      this.setState({
        error: null
      });
    }
  },

  componentDidUpdate: function(prevProps) {
    if (prevProps.component !== this.props.component) {
      deepForceUpdate(this);
    }
  },

  unstable_handleError: function(error) {
    this.setState({
      error: error
    });
  },

  render: function() {
    if (this.state.error) {
      return React.createElement(
        this.props.errorReporter,
        { error: this.state.error }
      );
    }

    return React.createElement(this.props.component);
  }
});

module.exports.AppContainer = AppContainer;
