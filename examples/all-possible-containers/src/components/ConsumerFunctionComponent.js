import React from 'react'
import Context from '../context'
import { EDIT_ME } from './_editMe'

const ConsumerFunctionComponent = () => (
  <Context.Consumer>
    {value => (
      <div>
        <fieldset>
          <legend>Consumer Function Component (value={value})</legend>
          {EDIT_ME}
        </fieldset>
      </div>
    )}
  </Context.Consumer>
)

export default ConsumerFunctionComponent
