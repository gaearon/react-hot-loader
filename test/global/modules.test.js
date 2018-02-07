import * as modules from '../../src/global/modules'

describe('modules', () => {
  it('should register enter/leave module', () => {
    const module = { id: 'myModule.js' }
    expect(modules.isOpened(module)).toBe(false)
    modules.enter(module)
    expect(modules.isOpened(module)).toBe(true)
    modules.leave(module)
    expect(modules.isOpened(module)).toBe(false)
  })
})
