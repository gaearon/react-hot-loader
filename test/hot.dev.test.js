import React, { Component } from 'react'
import { mount } from 'enzyme'
import {
  enter as enterModule,
  leave as leaveModule,
  isOpened,
  hotModule,
} from '../src/global/modules'
import '../src/index.dev'
import hot from '../src/hot.dev'
import logger from '../src/logger'
import { increment as incrementGeneration } from '../src/global/generation'

jest.mock('../src/logger')

describe('hot (dev)', () => {
  it('should attach to the general hot API', () => {
    const sourceModule = {
      id: 42,
      hot: {
        accept: jest.fn(),
      },
    }

    hot(sourceModule)
    expect(sourceModule.hot.accept).toBeCalled()
  })

  it('should attach to webpack hot API', () => {
    const sourceModule = {
      id: 42,
      hot: {
        accept: jest.fn(),
        status: () => 'idle',
        addStatusHandler: jest.fn(),
      },
    }

    hot(sourceModule)
    expect(hotModule(sourceModule.id).instances.length).toBe(0)
    expect(sourceModule.hot.accept).toHaveBeenCalledTimes(1)
    expect(sourceModule.hot.addStatusHandler).toHaveBeenCalledTimes(1)
  })

  it('should not attach on HRM event', () => {
    const sourceModule = {
      id: 42,
      hot: {
        accept: jest.fn(),
        status: () => 'not-idle',
        addStatusHandler: jest.fn(),
      },
    }

    hot(sourceModule)
    expect(sourceModule.hot.accept).toHaveBeenCalledTimes(1)
    expect(sourceModule.hot.addStatusHandler).not.toBeCalled()
  })

  it('should stand mount/unmount in normal situation', () => {
    const sourceModule = { id: 42 }
    const Component = () => <div>123</div>
    const HotComponent = hot(sourceModule)(Component)
    const wrapper = mount(<HotComponent />)
    wrapper.unmount()
  })

  it('should redraw component on HRM', done => {
    const callbacks = []
    const sourceModule = {
      id: 'error42',
      hot: {
        accept(callback) {
          callbacks.push(callback)
        },
      },
    }
    const spy = jest.fn()
    enterModule(sourceModule)

    class MyComponent extends Component {
      render() {
        spy()
        return <div>42</div>
      }
    }

    const HotComponent = hot(sourceModule)(MyComponent)
    hot(sourceModule)(MyComponent)
    mount(<HotComponent />)
    expect(spy).toHaveBeenCalledTimes(1)

    expect(callbacks.length).toBe(2)
    incrementGeneration()
    callbacks.forEach(cb => cb())
    expect(spy).toHaveBeenCalledTimes(1)
    setTimeout(() => {
      setTimeout(() => {
        expect(spy).toHaveBeenCalledTimes(3)
        done()
      }, 1)
    }, 1)
  })

  it('should trigger error in unmount in opened state', () => {
    const sourceModule = { id: 'error42_unmount' }
    logger.error.mockClear()
    enterModule(sourceModule)
    const Component = () => <div>123</div>
    const HotComponent = hot(sourceModule)(Component)
    expect(hotModule(sourceModule.id).instances.length).toBe(0)
    const wrapper1 = mount(<HotComponent />)
    const wrapper2 = mount(<HotComponent />)
    expect(hotModule(sourceModule.id).instances.length).toBe(2)
    wrapper1.unmount()
    expect(hotModule(sourceModule.id).instances.length).toBe(1)

    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error)
      .toHaveBeenCalledWith(`React-hot-loader: Detected AppContainer unmount on module 'error42_unmount' update.
Did you use "hot(Component)" and "ReactDOM.render()" in the same file?
"hot(Component)" shall only be used as export.
Please refer to "Getting Started" (https://github.com/gaearon/react-hot-loader/).`)

    wrapper2.unmount()
    expect(hotModule(sourceModule.id).instances.length).toBe(0)
  })

  it('it should track module state', () => {
    const sourceModule = { id: 'module42' }
    expect(isOpened(sourceModule)).toBe(false)
    enterModule(sourceModule)
    expect(isOpened(sourceModule)).toBe(true)
    enterModule(sourceModule)
    expect(isOpened(sourceModule)).toBe(true)
    //
    leaveModule(sourceModule)
    expect(isOpened(sourceModule)).toBe(false)
    leaveModule(sourceModule)
    expect(isOpened(sourceModule)).toBe(false)
  })

  it('it should stand wrong module definition', () => {
    const sourceModule = {}
    expect(isOpened(sourceModule)).toBe(false)
    enterModule(sourceModule)
    expect(isOpened(sourceModule)).toBe(false)
    leaveModule(sourceModule)
    expect(isOpened(sourceModule)).toBe(false)

    enterModule()
    isOpened()
    leaveModule()
  })
})
