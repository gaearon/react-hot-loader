// import loadable from 'loadable-components' // this is old API
import loadable from '@loadable/component'

export default loadable(() => import('../Counter'))
