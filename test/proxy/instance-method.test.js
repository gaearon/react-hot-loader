/* eslint-env jest */
import React from 'react'
import { createMounter, ensureNoWarnings } from './helper'
import createProxy from '../../src/proxy'

const createFixtures = () => ({
  modern: {
    shouldWarnOnBind: false,

    Counter1x: class Counter1x extends React.Component {
      constructor(props) {
        super(props)
        this.state = { counter: 0 }
      }

      increment() {
        this.setState({
          counter: this.state.counter + 1,
        })
      }

      render() {
        return <span>{this.state.counter}</span>
      }
    },

    Counter10x: class Counter10x extends React.Component {
      constructor(props) {
        super(props)
        this.state = { counter: 0 }
      }

      increment() {
        this.setState({
          counter: this.state.counter + 10,
        })
      }

      render() {
        return <span>{this.state.counter}</span>
      }
    },

    Counter100x: class Counter100x extends React.Component {
      constructor(props) {
        super(props)
        this.state = { counter: 0 }
      }

      increment() {
        this.setState({
          counter: this.state.counter + 100,
        })
      }

      render() {
        return <span>{this.state.counter}</span>
      }
    },

    CounterWithoutIncrementMethod: class CounterWithoutIncrementMethod extends React.Component {
      constructor(props) {
        super(props)
        this.state = { counter: 0 }
      }

      render() {
        return <span>{this.state.counter}</span>
      }
    },

    NotPureComponent: class NotPureComponent extends React.Component {
      shouldComponentUpdate() {
        return true
      }

      render() {
        return <span>Component</span>
      }
    },

    IsPureComponent: class IsPureComponent extends React.PureComponent {
      render() {
        return <span>PureComponent</span>
      }
    },
  },
})

describe('instance method', () => {
  const { getWarnSpy } = ensureNoWarnings()
  const { mount } = createMounter()

  Object.keys(createFixtures()).forEach(type => {
    describe(type, () => {
      it('gets added', () => {
        const { Counter1x, CounterWithoutIncrementMethod } = createFixtures()[
          type
        ]
        const proxy = createProxy(CounterWithoutIncrementMethod)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toEqual('0')

        proxy.update(Counter1x)
        wrapper.instance().increment()
        expect(wrapper.text()).toEqual('1')
      })

      it('gets replaced', () => {
        const { Counter1x, Counter10x, Counter100x } = createFixtures()[type]
        const proxy = createProxy(Counter1x)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toEqual('0')
        wrapper.instance().increment()
        expect(wrapper.text()).toEqual('1')

        proxy.update(Counter10x)
        wrapper.instance().increment()
        mount(<Proxy />)
        expect(wrapper.text()).toEqual('11')

        proxy.update(Counter100x)
        wrapper.instance().increment()
        mount(<Proxy />)
        expect(wrapper.text()).toEqual('111')
      })

      it('removes shouldComponentUpdate', () => {
        const { IsPureComponent, NotPureComponent } = createFixtures()[type]
        const proxy = createProxy(NotPureComponent)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toEqual('Component')
        expect(typeof wrapper.instance().shouldComponentUpdate).toBe('function')

        proxy.update(IsPureComponent)
        wrapper.instance().forceUpdate()

        mount(<Proxy />)
        expect(wrapper.text()).toEqual('PureComponent')
        expect(wrapper.instance().shouldComponentUpdate).toBeUndefined()
      })

      it('cant handle bound methods', () => {
        const { Counter1x, Counter10x, shouldWarnOnBind } = createFixtures()[
          type
        ]
        const proxy = createProxy(Counter1x)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        const instance = wrapper.instance()

        getWarnSpy().mockReset()
        const localWarnSpy = jest.spyOn(console, 'warn')

        instance.increment = instance.increment.bind(instance)

        expect(localWarnSpy).toHaveBeenCalledTimes(shouldWarnOnBind ? 1 : 0)

        expect(wrapper.text()).toEqual('0')
        instance.increment()
        expect(wrapper.text()).toEqual('1')

        proxy.update(Counter10x)
        instance.increment()
        mount(<Proxy />)
        expect(wrapper.text()).toEqual('2') // not 11
      })
    })
  })

  it('passes methods props thought', () => {
    const injectedMethod = (a, b) => this[24 + a + b]

    injectedMethod.staticProp = 'magic'

    class App extends React.Component {
      method() {
        return 42
      }
    }

    App.prototype.injectedMethod = injectedMethod

    const app1 = new App()

    expect(app1.injectedMethod).toBe(injectedMethod)
    expect(app1.injectedMethod.staticProp).toBe('magic')
    expect(String(app1.injectedMethod)).toBe(String(injectedMethod))

    const Proxy = createProxy(App).get()

    const app2 = new Proxy()

    expect(app2.injectedMethod).not.toBe(injectedMethod)
    expect(app2.injectedMethod.staticProp).toBe('magic')
    expect(app2.injectedMethod.length).toBe(2)
    expect(String(app2.injectedMethod)).toBe(String(injectedMethod))
  })
})
