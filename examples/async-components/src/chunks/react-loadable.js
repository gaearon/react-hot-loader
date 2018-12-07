import React from 'react'
import Loadable from 'react-loadable'

export const RLoadable1 = Loadable({
  loader: () => import('../Counter'),
  loading: () => <div />,
})

export const RLoadable2 = Loadable({
  loader: () => import('../Counter2'),
  loading: () => <div />,
})
