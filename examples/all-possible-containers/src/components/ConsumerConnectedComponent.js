import React from 'react'
import { connect } from '../context'
import { EDIT_ME } from './_editMe'

class ConsumerConnectedComponent extends React.Component {
  render() {
    return (
      <div>
        <fieldset>
          <legend>
            Consumer connected Component (value={this.props.consumedValue})
          </legend>
          {EDIT_ME}
        </fieldset>
      </div>
    )
  }
}

export default connect(ConsumerConnectedComponent)
