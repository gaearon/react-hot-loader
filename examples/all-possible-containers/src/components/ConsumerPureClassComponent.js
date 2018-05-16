import React from 'react'
import Context from '../context'
import { EDIT_ME } from './_editMe'

class ConsumerPureClassComponent extends React.Component {
  render() {
    return (
      <Context.Consumer>
        {value => (
          <div>
            <fieldset>
              <legend>Consumer Pure Class Component (value={value})</legend>
              {EDIT_ME}
            </fieldset>
          </div>
        )}
      </Context.Consumer>
    )
  }
}

export default ConsumerPureClassComponent
