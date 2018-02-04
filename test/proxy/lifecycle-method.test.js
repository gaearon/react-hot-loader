/* eslint-env jest */
import React, { Component } from 'react'
import { createMounter } from './helper'
import createProxy from '../../src/proxy'

describe('lifecycle method', () => {
  const { mount } = createMounter()

  class Controller extends Component {
    state = {
      update: 1,
    }

    render() {
      const { Proxy } = this.props
      return <Proxy update={this.state.update} />
    }
  }

  const testFabric = methodName => (Component, patchedRender, spy) => {
    class App1 extends Component {
      constructor() {
        super()
        this.secret = 1
        this.superSecret = 42
      }

      [methodName]() {
        spy()
        const oldRender = this.render.bind(this)
        this.render = () => {
          this.superSecret = this.secret + 1
          return patchedRender.call(this, oldRender)
        }
      }

      render() {
        return <div>{this.superSecret}</div>
      }
    }

    class App2 extends Component {
      constructor() {
        super()
        this.secret = 2
      }

      [methodName]() {
        spy()
      }

      render() {
        return <div>{this.superSecret * 2}</div>
      }
    }
    return { App1, App2 }
  }

  const getTestClass = (methodName, spy) => {
    function patchedRender(oldRender) {
      return <div>PATCHED + {oldRender()}</div>
    }
    return testFabric(methodName)(Component, patchedRender, spy)
  }

  it('handle componentWillMount', () => {
    const spy = jest.fn()
    const { App1, App2 } = getTestClass('componentWillMount', spy)

    const proxy = createProxy(App1)
    const Proxy = proxy.get()

    const wrapper = mount(<Controller Proxy={Proxy} />)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('PATCHED + 2')

    proxy.update(App2)
    wrapper.instance().forceUpdate()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('PATCHED + 6')
  })

  it('handle componentDidMount', () => {
    const spy = jest.fn()
    const { App1, App2 } = getTestClass('componentDidMount', spy)

    const proxy = createProxy(App1)
    const Proxy = proxy.get()

    const wrapper = mount(<Controller Proxy={Proxy} />)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('42')

    proxy.update(App2)
    wrapper.instance().forceUpdate()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('PATCHED + 6')
  })
})
