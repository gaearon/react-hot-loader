import React from 'react'
import ReactDOM from 'react-dom'

import ReactHotLoader from './reactHotLoader'
import './reconciler/proxyAdapter'

export { default as AppContainer } from './AppContainer.dev'
export { default as hot } from './hot.dev'
export { enter as enterModule, leave as leaveModule } from './global/modules'
export * from './utils.dev'
export default ReactHotLoader

if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
  ReactHotLoader.patch(React, ReactDOM)
}
