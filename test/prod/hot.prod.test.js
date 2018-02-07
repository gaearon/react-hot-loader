import React from 'react'
import { hot } from '../../src/index.prod'

describe('hot (prod)', () => {
  it('should be an identity', () => {
    const App = () => <div>Hello world!</div>
    const HotApp = hot()(App)
    expect(App).toBe(HotApp)
  })
})
