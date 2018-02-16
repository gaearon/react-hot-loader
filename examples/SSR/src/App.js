import { hot, setConfig } from 'react-hot-loader'
import * as React from 'react'
import Counter from './Counter'
// import hidden from './HiddenComponent';

const App = () => (
  <h1>
    <p>{40}!</p>
    <Counter />
    <div>
      {/*{hidden().counter}*/}
      SSR, and I work fine!
    </div>
  </h1>
)

setConfig({ logLevel: 'debug' })

export default hot(module)(App)
