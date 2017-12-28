import * as React from 'react'
import styled from 'styled-components'
import emoStyled from 'react-emotion'
import { hot } from 'react-hot-loader'
import Counter from './Counter'

const BigText = styled.div`
  font-size: 20px;
`

const SmallText = emoStyled('div')`
  font-size: 12px;
`

const App = () => (
  <h1>
    <BigText>Hello, world.</BigText>
    <br />
    <SmallText>Hello, world.</SmallText>
    <br />
    <Counter />
  </h1>
)

export default hot(module)(App)
