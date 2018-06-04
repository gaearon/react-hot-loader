import { hot, setConfig } from 'react-hot-loader'
import * as React from 'react'
import styled from 'styled-components'
import emoStyled from 'react-emotion'
import Counter from './Counter'

const BigText = styled.div`
  font-size: 20px;
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

const aNumber = 100500

const App = () => (
  <h1>
    <BigText>1.Hello, world! {aNumber} </BigText>
    <br />
    <SmallText>2.Hello, world.</SmallText>
    <br />
    <Counter />
    <indirect.element />
    {Counter === <Counter />.type ? 'Counter is cold' : 'Counter is hot'}
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
