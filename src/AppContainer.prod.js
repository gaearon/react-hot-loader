'use strict';

const React = require('react');
const { Component } = React;

class AppContainer extends Component {
  render() {
    if (this.props.component) {
      return <this.props.component {...this.props.prop} />;
    }

    return React.Children.only(this.props.children);
  }
}

module.exports = AppContainer;
