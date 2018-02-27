import * as React from 'react'
import { hot } from 'react-hot-loader'
import Counter from './Counter'

const App = () => (
  <h1>
    Hello, world.<br />
    <Counter />
  </h1>
)

export default hot(module)(App)
