import React from 'react'
import { hot } from 'react-hot-loader'
import Counter from './Counter'
import { Internal } from './Internal'

const Inner = ({ children }) => <div>{children}</div>

const indirect = {
  element: () => (
    <Inner>
      indirect! <Counter />
    </Inner>
  ),
}

const App = () => (
  <h1>
    Hello, world!<br />
    <Internal />
    <br />
    <Counter />
    <indirect.element />
  </h1>
)

export default hot(module)(App)
