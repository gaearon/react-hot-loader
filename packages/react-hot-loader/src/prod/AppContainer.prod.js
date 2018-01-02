/* eslint-disable react/prop-types */

import React, { Component } from 'react'

class AppContainer extends Component {
  render() {
    return React.Children.only(this.props.children)
  }
}

export default AppContainer
