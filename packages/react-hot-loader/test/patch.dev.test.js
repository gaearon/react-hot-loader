/* eslint-env jest */
import React from 'react'
import reactHotLoader from '../src/reactHotLoader'
import patchExport from '../src/patch.dev'

describe('patch', () => {
  it('should export reactHotLoader', () => {
    expect(patchExport).toBe(reactHotLoader)
  })

  it('should patch React methods', () => {
    expect(React.createElement.isPatchedByReactHotLoader).toBe(true)
    expect(React.createFactory.isPatchedByReactHotLoader).toBe(true)
    expect(React.Children.only.isPatchedByReactHotLoader).toBe(true)
  })
})
