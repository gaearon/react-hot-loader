import React from 'react'
import { Portal } from 'react-portal'
import hidden from './HiddenComponent'

const Hidden = hidden()

const APortal = () => (
  <Portal>
    This is a async portal
    <Hidden.counter />
  </Portal>
)

export default () => (
  <div>
    ASYNC
    <Hidden.counter />
    and <APortal />
  </div>
)
