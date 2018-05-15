import React from 'react'
import ChildrenAsFunctionComponent from './ChildrenAsFunctionComponent'
import { connect } from '../context'
import { EDIT_ME } from './_editMe'

const ConnectedChildrenAFComponent = ({ consumedValue }) => (
  <ChildrenAsFunctionComponent>
    {value => (
      <fieldset>
        <legend>
          Children as a function Component (value={value}, consumedValue={
            consumedValue
          })
        </legend>
        {EDIT_ME}
      </fieldset>
    )}
  </ChildrenAsFunctionComponent>
)

export default connect(ConnectedChildrenAFComponent)
