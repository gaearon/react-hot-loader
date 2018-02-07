/* eslint-disable react/prop-types */

import React from 'react'

class AppContainer extends React.Component {
  render() {
    return React.Children.only(this.props.children)
  }
}

export default AppContainer
