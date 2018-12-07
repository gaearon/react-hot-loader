// import loadable from 'loadable-components' // this is old API
import loadable from '@loadable/component'

export const Loadable1 = loadable(() => import('../Counter'))

export const Loadable2 = loadable(() => import('../Counter2'))
