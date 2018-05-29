import { hot } from 'react-hot-loader'
import * as React from 'react'
import Counter from './Counter'

const App = () => (
  <h1>
    Hello, world.<br />
    <Counter />
  </h1>
)

export default hot(module)(App)
