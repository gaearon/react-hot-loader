/* eslint-env jest */
import React from 'react'
import { ensureNoWarnings, createMounter } from './helper'
import createProxy from '../src'

const fixtures = {
  modern: {
    InstanceProperty: class InstanceProperty extends React.Component {
      answer = 42

      /* eslint-disable */
      __reactstandin__regenerateByEval(key, code) {
        this[key] = eval(code)
      }
      /* eslint-enable */

      render() {
        return <div>{this.answer}</div>
      }
    },

    InstancePropertyUpdate: class InstancePropertyUpdate extends React.Component {
      answer = 43

      /* eslint-disable */
      __reactstandin__regenerateByEval(key, code) {
        this[key] = eval(code)
      }
      /* eslint-enable */

      render() {
        return <div>{this.answer}</div>
      }
    },

    InstancePropertyRemoval: class InstancePropertyRemoval extends React.Component {
      /* eslint-disable */
      __reactstandin__regenerateByEval(key, code) {
        this[key] = eval(code)
      }
      /* eslint-enable */

      render() {
        return <div>{this.answer}</div>
      }
    },

    InstancePropertyFromLocal: class InstanceProperty extends React.Component {
      getAnswer = () => this.answer
      answer = 42

      /* eslint-disable */
      __reactstandin__regenerateByEval(key, code) {
        this[key] = eval(code)
      }
      /* eslint-enable */

      render() {
        return <div>{this.getAnswer()}</div>
      }
    },

    InstancePropertyFromContext: class InstanceProperty extends React.Component {
      /* eslint-disable arrow-body-style */
      getAnswer = () => {
        return this.answer
      }
      /* eslint-enable arrow-body-style */
      answer = 42

      /* eslint-disable */
      __reactstandin__regenerateByEval(key, code) {
        this[key] = eval(code)
      }
      /* eslint-enable */

      render() {
        return <div>{this.getAnswer()}</div>
      }
    },
  },
}

describe('instance property', () => {
  ensureNoWarnings()
  const { mount } = createMounter()

  Object.keys(fixtures).forEach(type => {
    describe(type, () => {
      const {
        InstanceProperty,
        InstancePropertyUpdate,
        InstancePropertyRemoval,
      } = fixtures[type]

      it('is available on proxy class instance', () => {
        const proxy = createProxy(InstanceProperty)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toBe('42')
        expect(wrapper.instance().answer).toBe(42)
      })

      it('is left unchanged when reassigned', () => {
        const proxy = createProxy(InstanceProperty)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toBe('42')

        wrapper.instance().answer = 100

        proxy.update(InstancePropertyUpdate)
        mount(<Proxy />)
        expect(wrapper.text()).toBe('43')
        expect(wrapper.instance().answer).toBe(43)

        proxy.update(InstancePropertyRemoval)
        mount(<Proxy />)
        expect(wrapper.text()).toBe('43')
        expect(wrapper.instance().answer).toBe(43)
      })

      /**
       * I'm not aware of any way of retrieving their new values
       * without calling the constructor, which seems like too much
       * of a side effect. We also don't want to overwrite them
       * in case they changed.
       */
      it('is left unchanged even if not reassigned (known limitation)', () => {
        const proxy = createProxy(InstanceProperty)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toBe('42')

        proxy.update(InstancePropertyUpdate)
        mount(<Proxy />)
        expect(wrapper.text()).toBe('43')
        expect(wrapper.instance().answer).toBe(43)

        proxy.update(InstancePropertyRemoval)
        mount(<Proxy />)
        expect(wrapper.text()).toBe('43')
        expect(wrapper.instance().answer).toBe(43)
      })
    })
  })

  describe('ES6 property', () => {
    // untestable without real arrow functions
    // it('show use the underlayer instance value', () => {
    //   const proxy = createProxy(fixtures.modern.InstancePropertyFromLocal);
    //   const Proxy = proxy.get();
    //   const instance = renderer.render(<Proxy />);
    //   expect(renderer.getRenderOutput().props.children).toBe(42);
    //   instance.answer = 100;
    //   renderer.render(<Proxy />);
    //   expect(renderer.getRenderOutput().props.children).toBe(42);
    // })

    it('show use the underlayer top value', () => {
      const proxy = createProxy(fixtures.modern.InstancePropertyFromContext)
      const Proxy = proxy.get()
      const wrapper = mount(<Proxy />)
      expect(wrapper.text()).toBe('42')
      wrapper.instance().answer = 100
      mount(<Proxy />)
      expect(wrapper.text()).toBe('100')
    })
  })
})
