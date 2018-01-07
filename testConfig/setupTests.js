/* eslint-disable global-require */
import React from 'react'
import Enzyme from 'enzyme'

function getAdapter() {
  if (React.version.startsWith('15')) {
    return require('enzyme-adapter-react-15')
  } else if (React.version.startsWith('16')) {
    return require('enzyme-adapter-react-16')
  }

  return null
}

const Adapter = getAdapter()

Enzyme.configure({ adapter: new Adapter() })
