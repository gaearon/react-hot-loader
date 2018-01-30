import React from 'react'
import { Portal } from 'react-portal'
import hidden from './HiddenComponent'

const Hidden = hidden()

const InPortal = ({ children }) => <div> + {children}</div>

export default () => (
  <Portal>
    <InPortal>
      This is a first portal
      <Hidden.counter />
    </InPortal>
  </Portal>
)
