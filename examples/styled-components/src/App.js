import { hot, setConfig } from 'react-hot-loader'
import * as React from 'react'
import styled from 'styled-components'
import emoStyled from 'react-emotion'
import Counter from './Counter'

const BigText = styled.div`
  font-size: 25px;
`

const SmallText = emoStyled('div')`
  font-size: 22px;
`

const indirect = {
  element: () => (
    <SmallText>
      hidden <Counter />
    </SmallText>
  ),
}

const indirectStyled = {
  DS: styled.div`
    border: 1px solid #f00;
  `,
  DE: emoStyled('div')`border: 1px solid #F00`,
}

const Async = React.lazy(() => import('./Async'))

const aNumber = 100500

const OtherComponent = () => <span>test 3</span>

const Memo = React.memo(() => (
  <div>
    [mem <OtherComponent />
    <Counter /> memo]
  </div>
))

const App = () => (
  <h1>
    <BigText>
      1.Hello, world! {aNumber} <Counter />
    </BigText>
    <br />
    <SmallText>
      2.Hello, world <Counter />.
    </SmallText>
    <br />
    <Counter />
    <Memo a1 a2 />
    <React.Suspense fallback="loading">
      <Async />
    </React.Suspense>
    <indirect.element />
    <indirectStyled.DS>
      {' '}
      indirect DS <Counter />{' '}
    </indirectStyled.DS>
    <indirectStyled.DE>
      {' '}
      indirect DE <Counter />{' '}
    </indirectStyled.DE>
    <div>
      {[
        <span key={1}>depend on aNumber - </span>,
        aNumber % 2 && <indirect.element key="2" />,
      ]}
    </div>
  </h1>
)

setConfig({ logLevel: 'debug' })

export default hot(module)(App)
