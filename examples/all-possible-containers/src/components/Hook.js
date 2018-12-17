import React, { useState, useEffect } from 'react'
import { hot } from 'react-hot-loader/root'

const SomeComponent = ac(() => import('./Counter'))
const App = () => (
  <div>
    <fieldset>
      <legend>Hook with Async context</legend>
      <SomeComponent />
    </fieldset>
  </div>
)
export default hot(App)

//
function ac(importComponent) {
  return function Component(props) {
    const [C, setComponent] = useState()
    useEffect(() => {
      importComponent().then(setComponent)
    }, [])
    return C ? <C.default {...props} /> : null
  }
}
