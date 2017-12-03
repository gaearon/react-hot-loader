/* eslint-env jest */
import React from 'react'
import { mount } from 'enzyme'
import createProxy from '../src'

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
  },
})

describe('instance method', () => {
  let warnSpy

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn')
  })

  afterEach(() => {
    expect(warnSpy).not.toHaveBeenCalled()
  })

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
        wrapper.mount()
        expect(wrapper.text()).toEqual('11')

        proxy.update(Counter100x)
        wrapper.instance().increment()
        wrapper.mount()
        expect(wrapper.text()).toEqual('111')
      })

      it('cant handle bound methods', () => {
        const { Counter1x, Counter10x, shouldWarnOnBind } = createFixtures()[
          type
        ]
        const proxy = createProxy(Counter1x)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        const instance = wrapper.instance()

        warnSpy.mockReset()
        const localWarnSpy = jest.spyOn(console, 'warn')

        instance.increment = instance.increment.bind(instance)

        expect(localWarnSpy).toHaveBeenCalledTimes(shouldWarnOnBind ? 1 : 0)

        expect(wrapper.text()).toEqual('0')
        instance.increment()
        expect(wrapper.text()).toEqual('1')

        proxy.update(Counter10x)
        instance.increment()
        wrapper.mount()
        expect(wrapper.text()).toEqual('2') // not 11
      })
    })
  })
})
