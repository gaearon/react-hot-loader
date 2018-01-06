/* eslint-env jest */
import React from 'react'
import { mount } from 'enzyme'
import moduleEntry, { isModuleOpened } from '../src/hotModule'
import hot from '../src/hot.dev'
import logger from '../src/logger'

jest.mock('../src/logger')

describe('module.hot', () => {
  describe('moduleEntry', () => {
    it('show track execution of a module', () => {
      const module = {
        id: 'test42',
      }

      expect(isModuleOpened(module)).toBe(false)

      moduleEntry.enter(module)
      expect(isModuleOpened(module)).toBe(true)

      moduleEntry.leave(module)
      expect(isModuleOpened(module)).toBe(false)
    })
  })

  describe('hot', () => {
    it('should attach to the general hot API', () => {
      const module = {
        id: 42,
        hot: {
          accept: jest.fn(),
        },
      }

      hot(module)
      expect(module.hot.accept).toBeCalled()
    })

    it('should attach to webpack hot API', () => {
      const module = {
        id: 42,
        hot: {
          accept: jest.fn(),
          status: () => 'idle',
          addStatusHandler: jest.fn(),
        },
      }

      hot(module)
      expect(module.hot.accept).toBeCalled()
      expect(module.hot.addStatusHandler).toBeCalled()
    })

    it('should not attach on HRM event', () => {
      const module = {
        id: 42,
        hot: {
          accept: jest.fn(),
          status: () => 'not-idle',
          addStatusHandler: jest.fn(),
        },
      }

      hot(module)
      expect(module.hot.accept).toBeCalled()
      expect(module.hot.addStatusHandler).not.toBeCalled()
    })

    it('should stand mount/unmount in normal situation', () => {
      const module = {
        id: 42,
      }
      const Component = () => <div>123</div>
      const HotComponent = hot(module)(Component)
      const wrapper = mount(<HotComponent />)
      wrapper.unmount()
    })

    it('should trigger error in unmount in opened state', () => {
      const module = {
        id: 'error42',
      }
      moduleEntry.enter(module)
      const Component = () => <div>123</div>
      const HotComponent = hot(module)(Component)
      const wrapper = mount(<HotComponent />)
      wrapper.unmount()
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error)
        .toHaveBeenCalledWith(`React-hot-loader: Detected AppContainer unmount on module 'error42' update.
Did you use "hot(Component)" and "ReactDOM.render()" in the same file?
"hot(Component)" shall only be used as export.
Please refer to "Getting Started" (https://github.com/gaearon/react-hot-loader/).`)
    })
  })
})
