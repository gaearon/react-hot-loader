import preact from 'preact'
import Counter from './Counter'

// Tell Babel to transform JSX into h() calls:
/** @jsx preact.h */

export const Internal = () => (
  <div>
    <Counter />
  </div>
)
