import React from 'react'
import { hot, setConfig } from 'react-hot-loader'
import Counter from './Counter'

const Element1 = ({ children }) => <div>Block1 {children}</div>

const Element2 = () => (
  <div>
    Block2 <Counter />
  </div>
)

const App = () => (
  <h1>
    Hello, mobx<br />
    <Counter />
    <Element1>
      <Counter />
    </Element1>
    <Element2 />
  </h1>
)

setConfig({ logLevel: 'debug' })

export default hot(module)(App)
