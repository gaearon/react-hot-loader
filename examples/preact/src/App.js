import React from 'react'
import { hot } from 'react-hot-loader'
import Counter from './Counter'
import { Internal } from './Internal'

const App = () => (
  <h1>
    Hello, world<br />
    <Internal />
    <br />
    <Counter />
  </h1>
)

export default hot(module)(App)
