import React from 'react'
import { Portal } from 'react-portal'
import Hidden from './HiddenComponent'

export default () => (
  <Portal>
    This is a first portal
    <Hidden.counter />
  </Portal>
)
