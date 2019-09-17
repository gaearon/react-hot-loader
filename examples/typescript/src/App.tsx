import { hot } from 'react-hot-loader/root'
import * as React from 'react'
import Counter from './Counter'

const App = () => (
  <div>
    <h1>Hello, world.</ h1>
    <Counter/>
  </div>
)

export default hot(App)
