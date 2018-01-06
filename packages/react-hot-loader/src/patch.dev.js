import React from 'react'
import reactHotLoader from './reactHotLoader'

reactHotLoader.patch(React)

export { enter as enterModule, leave as leaveModule } from './global/modules'
export default reactHotLoader
