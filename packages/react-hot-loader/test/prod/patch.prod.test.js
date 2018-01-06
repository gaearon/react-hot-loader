import React from 'react'
import patchExport from '../../src/prod/patch.prod'

describe('patch (prod)', () => {
  it('should export null', () => {
    expect(patchExport).toBe(null)
  })

  it('should not patch React methods', () => {
    expect(React.createElement.isPatchedByReactHotLoader).toBe(undefined)
    expect(React.createFactory.isPatchedByReactHotLoader).toBe(undefined)
    expect(React.Children.only.isPatchedByReactHotLoader).toBe(undefined)
  })
})
