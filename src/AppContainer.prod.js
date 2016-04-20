const React = require('react');
const { Component } = React;

class AppContainer extends Component {
  render() {
    return React.Children.only(this.props.children);
  }
}

module.exports = AppContainer;
