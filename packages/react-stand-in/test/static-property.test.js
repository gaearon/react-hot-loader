/* eslint-env jest */
/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import PropTypes from 'prop-types'
import { mount } from 'enzyme'
import createProxy from '../src'

const fixtures = {
  modern: {
    StaticProperty: class StaticProperty extends React.Component {
      static answer = 42

      render() {
        return <div>{this.constructor.answer}</div>
      }
    },

    StaticPropertyUpdate: class StaticPropertyUpdate extends React.Component {
      static answer = 43

      render() {
        return <div>{this.constructor.answer}</div>
      }
    },

    StaticPropertyRemoval: class StaticPropertyRemoval extends React.Component {
      render() {
        return <div>{this.constructor.answer}</div>
      }
    },

    WithPropTypes: class WithPropTypes extends React.Component {
      static propTypes = {
        something: PropTypes.number,
      }

      static contextTypes = {
        something: PropTypes.number,
      }

      static childContextTypes = {
        something: PropTypes.number,
      }

      render() {
        return null
      }
    },

    WithPropTypesUpdate: class WithPropTypesUpdate extends React.Component {
      static propTypes = {
        something: PropTypes.string,
      }

      static contextTypes = {
        something: PropTypes.string,
      }

      static childContextTypes = {
        something: PropTypes.string,
      }

      render() {
        return null
      }
    },
  },
}

describe('static property', () => {
  let warnSpy

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn')
  })

  afterEach(() => {
    expect(warnSpy).not.toHaveBeenCalled()
  })

  Object.keys(fixtures).forEach(type => {
    describe(type, () => {
      const {
        StaticProperty,
        StaticPropertyUpdate,
        StaticPropertyRemoval,
        WithPropTypes,
        WithPropTypesUpdate,
      } = fixtures[type]

      it('is available on proxy class instance', () => {
        const proxy = createProxy(StaticProperty)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toBe('42')
        expect(Proxy.answer).toBe(42)
      })

      it('is own on proxy class instance', () => {
        const proxy = createProxy(StaticProperty)
        const Proxy = proxy.get()
        expect(Proxy.hasOwnProperty('answer')).toBe(true)
      })

      it('is changed when not reassigned', () => {
        const proxy = createProxy(StaticProperty)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toBe('42')

        proxy.update(StaticPropertyUpdate)
        wrapper.mount()
        expect(wrapper.text()).toBe('43')
        expect(Proxy.answer).toBe(43)

        proxy.update(StaticPropertyRemoval)
        wrapper.mount()
        expect(wrapper.text()).toBe('')
        expect(Proxy.answer).toBe(undefined)
      })

      it('is changed for propTypes, contextTypes, childContextTypes', () => {
        const proxy = createProxy(WithPropTypes)
        const PropTypesProxy = proxy.get()
        expect(PropTypesProxy.propTypes.something).toBe(PropTypes.number)
        expect(PropTypesProxy.contextTypes.something).toBe(PropTypes.number)
        expect(PropTypesProxy.childContextTypes.something).toBe(
          PropTypes.number,
        )

        proxy.update(WithPropTypesUpdate)
        expect(PropTypesProxy.propTypes.something).toBe(PropTypes.string)
        expect(PropTypesProxy.contextTypes.something).toBe(PropTypes.string)
        expect(PropTypesProxy.childContextTypes.something).toBe(
          PropTypes.string,
        )
      })

      /**
       * Sometimes people dynamically store stuff on statics.
       */
      it('is not changed when reassigned', () => {
        const proxy = createProxy(StaticProperty)
        const Proxy = proxy.get()
        const wrapper = mount(<Proxy />)
        expect(wrapper.text()).toBe('42')

        Proxy.answer = 100

        proxy.update(StaticPropertyUpdate)
        wrapper.mount()
        expect(wrapper.text()).toBe('100')
        expect(Proxy.answer).toBe(100)

        proxy.update(StaticPropertyRemoval)
        wrapper.mount()
        expect(wrapper.text()).toBe('100')
        expect(Proxy.answer).toBe(100)
      })
    })
  })
})
