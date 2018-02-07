import React from 'react'
import { shallow } from 'enzyme'
import { AppContainer } from '../../src/index.prod'

describe('AppContainer (prod)', () => {
  it('should render child', () => {
    const App = () => <div>Hello world!</div>
    const wrapper = shallow(
      <AppContainer>
        <App />
      </AppContainer>,
    )
    expect(wrapper.equals(<App />)).toBe(true)
  })

  it('should throw an error with several children', () => {
    const App = () => <div>Hello world!</div>
    expect(() => {
      shallow(
        <AppContainer>
          <App />
          <App />
        </AppContainer>,
      )
    }).toThrow()
  })
})
