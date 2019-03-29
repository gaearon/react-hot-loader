import React from 'react'
import { hot } from 'react-hot-loader/root'
import Counter from './Counter'

const App = () => (
  <h1>
    Hello, world.<br />
    <Counter />
  </h1>
)

export default hot(App)
