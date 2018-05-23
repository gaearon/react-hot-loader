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
        return <div>!{this.superSecret * 5}</div>
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

  it('handle componentWillMount', done => {
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
    // first render before hot render
    expect(wrapper.text()).toContain('PATCHED + !10')
    wrapper.instance().forceUpdate()
    expect(wrapper.text()).toContain('PATCHED + !15')
    done()
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
    // first render before hot render
    expect(wrapper.text()).toContain('PATCHED + !10')
    wrapper.instance().forceUpdate()
    expect(wrapper.text()).toContain('PATCHED + !15')
  })

  it('handle dynamic method creation', () => {
    class App1 extends Component {
      method1 = () => 41 + this.var1

      var1 = 1

      render() {
        return <div>{this.method1()}</div>
      }
    }

    class App2 extends Component {
      method2 = () => 22 + this.var2

      var2 = 2

      /* eslint-disable */
      __reactstandin__regenerateByEval(key, code) {
        this[key] = eval(code)
      }
      /* eslint-enable */

      render() {
        return (
          <div>
            {this.method1()} + {this.method2()}
          </div>
        )
      }
    }

    const proxy = createProxy(App1)
    const Proxy = proxy.get()

    const wrapper = mount(<Controller Proxy={Proxy} />)

    expect(wrapper.text()).toContain('42')

    proxy.update(App2)
    wrapper.instance().forceUpdate()

    // first render before hot render
    expect(wrapper.text()).toContain('42')
    wrapper.instance().forceUpdate()
    // both methods expected to be present
    expect(wrapper.text()).toContain('42 + 24')
  })
})
