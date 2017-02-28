/* eslint-disable react/prop-types */

'use strict';

const React = require('react');
const { Component } = React;

class AppContainer extends Component {
  render() {
    if (this.props.component) {
      return <this.props.component {...this.props.props} />;
    }

    return React.Children.only(this.props.children);
  }
}

module.exports = AppContainer;
