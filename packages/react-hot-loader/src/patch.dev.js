import React from 'react'
import reactHotLoader from './reactHotLoader'
import moduleEntry from './hotModule'

reactHotLoader.patch(React)

export { moduleEntry }

export default reactHotLoader
