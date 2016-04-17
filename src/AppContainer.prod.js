const React = require('react');
const { Component } = React;

class AppContainer extends Component {
  render() {
    return <this.props.component />;
  }
}

module.exports = AppContainer;
