import React from 'react'
import { Portal } from 'react-portal'
import hidden from './HiddenComponent'

const APortal = () => (
  <Portal>
    This is a async portal
    <hidden.counter />
  </Portal>
)

export default () => (
  <div>
    ASYNC
    <hidden.counter />
    and <APortal />
  </div>
)
