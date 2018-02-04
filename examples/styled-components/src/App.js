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
      hidden2 <Counter />
    </SmallText>
  ),
}

const aNumber = 100500

const App = () => (
  <h1>
    <BigText>1.Hello, world!! {aNumber} </BigText>
    <br />
    <SmallText>2.Hello, world.</SmallText>
    <br />
    <Counter />
    <indirect.element />
  </h1>
)

setConfig({ logLevel: 'debug' })

export default hot(module)(App)
