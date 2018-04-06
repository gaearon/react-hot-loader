/* eslint-env browser */
import { proxyWrapper } from '../../src/reconciler/proxyAdapter'
import * as proxies from '../../src/reconciler/proxies'
import reactHotLoader from '../../src/reactHotLoader'
import { unscheduleUpdate } from '../../src/reconciler/hotReplacementRender'

jest.mock('../../src/reconciler/proxies')
jest.mock('../../src/reconciler/hotReplacementRender')

proxies.getProxyByType.mockReturnValue({ get: () => 'proxy' })

describe(`proxyAdapter`, () => {
  const fn = () => {}

  it('should handle empty result', () => {
    expect(proxyWrapper()).toBe(undefined)
    expect(proxyWrapper(null)).toBe(null)
  })

  it('should handle arrays', () => {
    expect(proxyWrapper([1, 2, 3])).toEqual([1, 2, 3])
    expect(proxyWrapper([{ type: fn, prop: 42 }])).toEqual([
      { type: 'proxy', prop: 42 },
    ])
  })

  it('should handle elements', () => {
    expect(proxyWrapper({ type: fn, prop: 42 })).toEqual({
      type: 'proxy',
      prop: 42,
    })
  })

  it('should remove rendered proxy', () => {
    const object = {}
    unscheduleUpdate.mockClear()
    reactHotLoader.disableProxyCreation = 1
    proxyWrapper.call(object)
    expect(unscheduleUpdate).not.toHaveBeenCalled()

    reactHotLoader.disableProxyCreation = 0
    proxyWrapper.call(object)
    expect(unscheduleUpdate).toHaveBeenCalledWith(object)
  })
})
