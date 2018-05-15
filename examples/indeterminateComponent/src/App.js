import { hot, setConfig } from 'react-hot-loader'
import * as React from 'react'
import Counter from './Counter'

class AsyncMiddle1 extends React.Component {
  render() {
    return (
      <div>
        1:<Counter />
      </div>
    )
  }
}

class AsyncMiddle2 extends React.Component {
  render() {
    return (
      <div>
        2:<Counter />
      </div>
    )
  }
}

const DeferAsync = (props, context) => {
  if (props.n === 1) {
    return new AsyncMiddle1(props, context)
  }
  return new AsyncMiddle2(props, context)
}

const SimpleWrapper = () => (
  <div>
    C: <Counter /> 44
  </div>
)

const App = () => (
  <h1>
    1. <SimpleWrapper />
    2. <DeferAsync test={3} n={1} />
    3. <DeferAsync test={3} n={2} />
    4.{' '}
    <Counter>
      inner:<Counter />
    </Counter>
    test#5
  </h1>
)

setConfig({ logLevel: 'debug' })

export default hot(module)(App)
