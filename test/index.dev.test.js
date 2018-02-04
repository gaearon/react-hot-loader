import React from 'react'
import * as indexExport from '../src/index.dev'

describe('patch (dev)', () => {
  it('should export reactHotLoader', () => {
    expect(typeof indexExport.hot).toBe('function')
    expect(typeof indexExport.AppContainer).toBe('function')
  })

  it('should patch React methods', () => {
    expect(React.createElement.isPatchedByReactHotLoader).toBe(true)
    expect(React.createFactory.isPatchedByReactHotLoader).toBe(true)
    expect(React.Children.only.isPatchedByReactHotLoader).toBe(true)
  })
})
