import React from 'react'
import ChildrenAsFunctionComponent from './ChildrenAsFunctionComponent'
import { EDIT_ME } from './_editMe'

const ChildrenAsFunctionExample = () => (
  <ChildrenAsFunctionComponent>
    {value => (
      <fieldset>
        <legend>Children as a function Component (value={value})</legend>
        {EDIT_ME}
      </fieldset>
    )}
  </ChildrenAsFunctionComponent>
)

export default ChildrenAsFunctionExample
