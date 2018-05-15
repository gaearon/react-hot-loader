import React from 'react'
import Context from '../context'
import { EDIT_ME } from './_editMe'

/**
 * The bug is reproduced in this file, edit the content of PureTest and see it doesn't update
 * (Changing the PureComponent to Component makes the HMR work)
 */

class PureTest extends React.PureComponent {
  render() {
    return (
      <div>
        <fieldset>
          <legend>
            Function Consumer Pure Class Component (value={this.props.value})
          </legend>
          {EDIT_ME}
        </fieldset>
      </div>
    )
  }
}

const FunctionConsumerPureClassComponent = props => (
  <Context.Consumer>
    {value => (
      <Context.Provider value={value + 'nested'}>
        <Context.Consumer>
          {value => <PureTest value={value} {...props} />}
        </Context.Consumer>
      </Context.Provider>
    )}
  </Context.Consumer>
)

export default FunctionConsumerPureClassComponent
