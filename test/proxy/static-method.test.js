/* eslint-env jest */
import React from 'react'
import { ensureNoWarnings, createMounter } from './helper'
import createProxy from '../../src/proxy'

const fixtures = {
  modern: {
    StaticMethod: class StaticMethod extends React.Component {
      static getAnswer() {
        return 42
      }

      render() {
        return <div>{this.constructor.getAnswer()}</div>
      }
    },

    StaticMethodUpdate: class StaticMethodUpdate extends React.Component {
      static getAnswer() {
        return 43
      }

      render() {
        return <div>{this.constructor.getAnswer()}</div>
      }
    },

    StaticMethodRemoval: class StaticMethodRemoval extends React.Component {
      render() {
        return <div>{this.constructor.getAnswer()}</div>
      }
    },
  },
}

describe('static method', () => {
  ensureNoWarnings()
  const { mount } = createMounter()

  Object.keys(fixtures).forEach(type => {
    describe(type, () => {
      const {
        StaticMethod,
        StaticMethodUpdate,
        StaticMethodRemoval,
      } = fixtures[type]

      it('is available on proxy class instance', () => {
        const proxy = createProxy(StaticMethod)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toBe('42')
        expect(Proxy.getAnswer()).toBe(42)
      })

      it('is own on proxy class instance', () => {
        const proxy = createProxy(StaticMethod)
        const Proxy = proxy.get()
        expect(Proxy.hasOwnProperty('getAnswer')).toBe(true)
      })

      it('gets added', () => {
        const proxy = createProxy(StaticMethodRemoval)
        const Proxy = proxy.get()
        expect(Proxy.getAnswer).toBe(undefined)

        proxy.update(StaticMethod)
        try {
          // will throw error in es2015 mode
          const wrapper = mount(<Proxy />)
          expect(wrapper.text()).toBe('42')
          expect(Proxy.getAnswer()).toBe(42)
        } catch (e) {
          // ES2015 error
        }
      })

      it('gets replaced', () => {
        const proxy = createProxy(StaticMethod)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toBe('42')
        expect(Proxy.getAnswer()).toBe(42)

        proxy.update(StaticMethodUpdate)
        mount(<Proxy />)
        expect(wrapper.text()).toBe('43')
        expect(Proxy.getAnswer()).toBe(43)
      })

      it('get replaced if bound', () => {
        const proxy = createProxy(StaticMethod)
        const Proxy = proxy.get()
        Proxy.getAnswer = Proxy.getAnswer.bind(Proxy)
        const { getAnswer } = Proxy

        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toBe('42')

        proxy.update(StaticMethodUpdate)
        mount(<Proxy />)

        expect(wrapper.text()).toBe('42')
        expect(Proxy.getAnswer()).toBe(42)
        expect(getAnswer()).toBe(42)
      })

      it('is detached if deleted', () => {
        const proxy = createProxy(StaticMethod)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toBe('42')
        expect(Proxy.getAnswer()).toBe(42)

        proxy.update(StaticMethodRemoval)
        console.error = jest.fn()
        // Waiting for a fix in Jest
        // expect(() => wrapper.instance().forceUpdate()).toThrow()
        // expect(() => mount(<Proxy />)).toThrow()
        expect(Proxy.getAnswer).toBe(undefined)
      })
    })
  })
})
