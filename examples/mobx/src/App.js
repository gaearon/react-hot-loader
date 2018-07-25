import React from 'react'
import { hot, setConfig } from 'react-hot-loader'
import Counter from './Counter'

const App = () => (
  <h1>
    Hello, world.<br />
    <Counter />
  </h1>
)

setConfig({ logLevel: 'debug' })

export default hot(module)(App)
