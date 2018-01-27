import { hot, setConfig } from 'react-hot-loader'
import * as React from 'react'
import Counter from './Counter'
import AsyncComponent from './async-component'
import Portal from './Portal'

const importer = () => import('./DeferredRender')
const Async = () => <AsyncComponent importer={importer} />

const App = () => (
  <h1>
    <p>{40}!</p>
    <Counter />
    <Async />
    <Portal />
  </h1>
)

setConfig({ logLevel: 'debug' })

export default hot(module)(App)
