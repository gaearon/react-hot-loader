/* eslint-env jest */
import React from 'react'
import { ensureNoWarnings, createMounter } from './helper'
import createProxy from '../src'

const createFixtures = () => ({
  modern: {
    StaticDescriptor: class StaticDescriptor extends React.Component {
      static get answer() {
        return 42
      }

      static set something(value) {
        this._something = value * 2
      }

      render() {
        return <div>{this.constructor.answer}</div>
      }
    },

    StaticDescriptorUpdate: class StaticDescriptorUpdate extends React.Component {
      static get answer() {
        return 43
      }

      static set something(value) {
        this._something = value * 3
      }

      render() {
        return <div>{this.constructor.answer}</div>
      }
    },

    StaticDescriptorRemoval: class StaticDescriptorRemoval extends React.Component {
      render() {
        return <div>{this.constructor.answer}</div>
      }
    },

    ThrowingAccessors: class ThrowingAccessors extends React.Component {
      static get something() {
        throw new Error()
      }

      static set something(value) {
        throw new Error()
      }

      render() {
        return null
      }
    },
  },
})

describe('static descriptor', () => {
  ensureNoWarnings()
  const { mount } = createMounter()

  Object.keys(createFixtures()).forEach(type => {
    let fixtures;

    describe(type, () => {
      beforeEach( () => fixtures = createFixtures()[type])

      it('does not invoke accessors', () => {
        const {
          StaticDescriptor,
          ThrowingAccessors,
        } = fixtures;
        const proxy = createProxy(StaticDescriptor)
        const Proxy = proxy.get()
        mount(<Proxy />)
        expect(() => proxy.update(ThrowingAccessors)).not.toThrow()
      })

      describe('getter', () => {
        beforeEach( () => fixtures = createFixtures()[type])

        it('is available on proxy class', () => {
          const {
            StaticDescriptor,
          } = fixtures;
          const proxy = createProxy(StaticDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy />)
          expect(wrapper.text()).toEqual('42')
          expect(wrapper.instance().constructor.answer).toEqual(42)
          expect(Proxy.answer).toEqual(42)
        })

        it('gets added', () => {
          const {
            StaticDescriptor,
            StaticDescriptorRemoval,
          } = fixtures;
          const proxy = createProxy(StaticDescriptorRemoval)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy />)
          expect(wrapper.text()).toEqual('')

          proxy.update(StaticDescriptor)
          mount(<Proxy />)
          expect(wrapper.text()).toEqual('42')
          expect(wrapper.instance().constructor.answer).toEqual(42)
        })

        it('gets replaced', () => {
          const {
            StaticDescriptor,
            StaticDescriptorUpdate,
            StaticDescriptorRemoval,
          } = fixtures;
          const proxy = createProxy(StaticDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy />)
          expect(wrapper.text()).toEqual('42')

          proxy.update(StaticDescriptorUpdate)
          mount(<Proxy />)
          expect(wrapper.text()).toEqual('43')
          expect(wrapper.instance().constructor.answer).toEqual(43)

          proxy.update(StaticDescriptorRemoval)
          mount(<Proxy />)
          expect(wrapper.text()).toEqual('')
          expect(wrapper.instance().answer).toEqual(undefined)
        })

        it('gets redefined', () => {
          const {
            StaticDescriptor,
            StaticDescriptorUpdate,
            StaticDescriptorRemoval,
          } = fixtures;
          const proxy = createProxy(StaticDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy />)
          expect(wrapper.text()).toEqual('42')

          Object.defineProperty(wrapper.instance().constructor, 'answer', {
            value: 7,
          })

          proxy.update(StaticDescriptorUpdate)
          mount(<Proxy />)
          expect(wrapper.text()).toEqual('7')
          expect(wrapper.instance().constructor.answer).toEqual(7)

          proxy.update(StaticDescriptorRemoval)
          mount(<Proxy />)
          expect(wrapper.text()).toEqual('7')
          expect(wrapper.instance().constructor.answer).toEqual(7)
        })
      })

      describe('setter', () => {
        beforeEach( () => fixtures = createFixtures()[type])

        it('is available on proxy class instance', () => {
          const {
            StaticDescriptor,
          } = fixtures;
          const proxy = createProxy(StaticDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy />)
          wrapper.instance().constructor.something = 10
        })

        it('gets added', () => {
          const {
            StaticDescriptor,
            StaticDescriptorRemoval,
          } = fixtures;
          const proxy = createProxy(StaticDescriptorRemoval)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy />)

          proxy.update(StaticDescriptor)
          wrapper.instance().constructor.something = 10
          expect(wrapper.instance().constructor._something).toEqual(20)
        })

        it('gets replaced', () => {
          const {
            StaticDescriptor,
            StaticDescriptorUpdate,
            StaticDescriptorRemoval,
          } = fixtures;
          const proxy = createProxy(StaticDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy />)
          wrapper.instance().constructor.something = 10
          expect(wrapper.instance().constructor._something).toEqual(20)

          proxy.update(StaticDescriptorUpdate)
          expect(wrapper.instance().constructor._something).toEqual(20)
          wrapper.instance().constructor.something = 10
          expect(wrapper.instance().constructor._something).toEqual(30)

          proxy.update(StaticDescriptorRemoval)
          expect(wrapper.instance().constructor._something).toEqual(30)

          console.error = jest.fn()
          expect(() => {
            wrapper.instance().constructor.something = 7
          }).toThrow()
          expect(wrapper.instance().constructor._something).toEqual(30)
        })

        it('gets redefined', () => {
          const {
            StaticDescriptor,
            StaticDescriptorUpdate,
          } = fixtures;
          const proxy = createProxy(StaticDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy />)
          expect(wrapper.text()).toEqual('42')

          Object.defineProperty(wrapper.instance().constructor, 'something', {
            value: 50,
          })

          proxy.update(StaticDescriptorUpdate)
          expect(wrapper.instance().constructor.something).toEqual(50)
        })
      })
    })
  })
})
