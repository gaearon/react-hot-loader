import React from 'react'
import { mount } from 'enzyme'
import { enter as enterModule } from '../src/global/modules'
import hot from '../src/hot.dev'
import logger from '../src/logger'

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

  it('should trigger error in unmount in opened state', () => {
    const sourceModule = { id: 'error42' }
    enterModule(sourceModule)
    const Component = () => <div>123</div>
    const HotComponent = hot(sourceModule)(Component)
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
