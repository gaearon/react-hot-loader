import React from 'react'
import Counter from './Counter'

const hidden = function() {
  return {
    counter: () => (
      <div>
        this is hidden counter(<Counter />)
      </div>
    ),
  }
}

export default hidden
