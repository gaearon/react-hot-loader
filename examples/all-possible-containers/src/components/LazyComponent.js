import React from 'react'
import { EDIT_ME } from './_editMe'
import Counter from './Counter'

const LazyComponent = () => (
  <div>
    <fieldset>
      <legend>Lazy Component</legend>
      {EDIT_ME}
      <Counter />
    </fieldset>
  </div>
)

export default LazyComponent
