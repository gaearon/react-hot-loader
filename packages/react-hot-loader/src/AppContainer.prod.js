/* eslint-disable react/prop-types */

import React, { Component } from 'react'

class AppContainer extends Component {
  render() {
    if (this.props.component) {
      return <this.props.component {...this.props.props} />
    }

    return React.Children.only(this.props.children)
  }
}

export default AppContainer
