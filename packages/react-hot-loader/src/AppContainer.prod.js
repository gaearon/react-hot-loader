/* eslint-disable react/prop-types */

import React from 'react'

function AppContainer(props) {
  return React.Children.only(props.children)
}

export default AppContainer
