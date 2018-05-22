import React from 'react'
import { EDIT_ME } from './_editMe'

class ClassComponent extends React.PureComponent {
  render() {
    return (
      <div>
        <fieldset>
          <legend>Pure Class Component</legend>
          {EDIT_ME}
        </fieldset>
      </div>
    )
  }
}

export default ClassComponent
