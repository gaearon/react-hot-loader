import React from 'react'
import ReactHotLoader from './reactHotLoader'
import './reconciler/proxyAdapter'

export { default as AppContainer } from './AppContainer.dev'
export { default as hot } from './hot.dev'
export { enter as enterModule, leave as leaveModule } from './global/modules'
export * from './utils.dev'
export default ReactHotLoader

ReactHotLoader.patch(React)
