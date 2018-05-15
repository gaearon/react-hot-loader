import React from 'react'
import Context from '../context'
import { EDIT_ME } from './_editMe'

class ConsumerClassComponent extends React.Component {
  render() {
    return (
      <Context.Consumer>
        {value => (
          <div>
            <fieldset>
              <legend>Consumer Class Component (value={value})</legend>
              {EDIT_ME}
            </fieldset>
          </div>
        )}
      </Context.Consumer>
    )
  }
}

export default ConsumerClassComponent
