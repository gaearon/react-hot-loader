import { hot, setConfig } from 'react-hot-loader'
import * as React from 'react'
import styled from 'styled-components'
import emoStyled from 'react-emotion'

import CAsync from './chunks/async-component'
import CLoadableComp from './chunks/loadable-components'
import CLoadable from './chunks/react-loadable'
import CImp from './chunks/react-imported-component'
import CUni from './chunks/react-universal-component'

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

const App = () => (
  <div>
    Testing React-Hot-Loader againts "React code splitting" components
    <ul>
      <li>
        Async-components <CAsync />
      </li>
      <li>
        Loadable-components <CLoadableComp />
      </li>
      <li>
        React-Loadable <CLoadable />
      </li>
      <li>
        Imported-component <CImp />
      </li>
      <li>
        Universal-component <CUni />
      </li>
    </ul>
  </div>
)

setConfig({ logLevel: 'debug' })

export default hot(module)(App)
