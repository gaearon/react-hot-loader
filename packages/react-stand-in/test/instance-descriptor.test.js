/* eslint-env jest */
import React from 'react'
import { createMounter, ensureNoWarnings } from './helper'
import createProxy from '../lib'

const createFixtures = () => ({
  modern: {
    InstanceDescriptor: class InstanceDescriptor extends React.Component {
      get answer() {
        return this.props.base + 42
      }

      set something(value) {
        this._something = value * 2
      }

      render() {
        return <div>{this.answer || ''}</div>
      }
    },

    InstanceDescriptorUpdate: class InstanceDescriptorUpdate extends React.Component {
      get answer() {
        return this.props.base + 43
      }

      set something(value) {
        this._something = value * 3
      }

      render() {
        return <div>{this.answer}</div>
      }
    },

    InstanceDescriptorRemoval: class InstanceDescriptorRemoval extends React.Component {
      render() {
        return <div>{this.answer}</div>
      }
    },

    ThrowingAccessors: class ThrowingAccessors extends React.Component {
      get something() {
        throw new Error()
      }

      set something(value) {
        throw new Error()
      }

      render() {
        return null
      }
    },
  },
})

describe('instance descriptor', () => {
  ensureNoWarnings()
  const { mount } = createMounter()

  Object.keys(createFixtures()).forEach(type => {
    describe(type, () => {
      it('does not invoke accessors', () => {
        const { InstanceDescriptor, ThrowingAccessors } = createFixtures()[type]
        const proxy = createProxy(InstanceDescriptor)
        const Proxy = proxy.get()
        mount(<Proxy />)
        expect(() => proxy.update(ThrowingAccessors)).not.toThrow()
      })

      describe('getter', () => {
        it('is available on proxy class instance', () => {
          const { InstanceDescriptor } = createFixtures()[type]
          const proxy = createProxy(InstanceDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy base={100} />)
          expect(wrapper.text()).toBe('142')
          expect(wrapper.instance().answer).toBe(142)
        })

        it('gets added', () => {
          const {
            InstanceDescriptor,
            InstanceDescriptorRemoval,
          } = createFixtures()[type]
          const proxy = createProxy(InstanceDescriptorRemoval)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy base={100} />)
          expect(wrapper.text()).toBe('')

          proxy.update(InstanceDescriptor)
          const wrapper2 = mount(<Proxy base={100} />)
          expect(wrapper2.text()).toBe('142')
          expect(wrapper2.instance().answer).toBe(142)
        })

        it('gets replaced', () => {
          const {
            InstanceDescriptor,
            InstanceDescriptorUpdate,
            InstanceDescriptorRemoval,
          } = createFixtures()[type]

          const proxy = createProxy(InstanceDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy base={100} />)
          const instance = wrapper.instance()
          expect(wrapper.text()).toBe('142')

          proxy.update(InstanceDescriptorUpdate)
          const wrapper2 = mount(<Proxy base={100} />)
          expect(wrapper2.text()).toBe('143')
          expect(instance.answer).toBe(143)

          proxy.update(InstanceDescriptorRemoval)
          const wrapper3 = mount(<Proxy base={100} />)
          expect(wrapper3.text()).toBe('')
          expect(instance.answer).toBe(undefined)
        })

        it('gets redefined', () => {
          const {
            InstanceDescriptor,
            InstanceDescriptorUpdate,
            InstanceDescriptorRemoval,
          } = createFixtures()[type]

          const proxy = createProxy(InstanceDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy base={100} />)
          expect(wrapper.text()).toBe('142')

          Object.defineProperty(wrapper.instance(), 'answer', { value: 7 })

          proxy.update(InstanceDescriptorUpdate)
          mount(<Proxy base={100} />)
          expect(wrapper.text()).toBe('7')
          expect(wrapper.instance().answer).toBe(7)

          proxy.update(InstanceDescriptorRemoval)
          expect(wrapper.text()).toBe('7')
          expect(wrapper.instance().answer).toBe(7)
        })
      })

      describe('setter', () => {
        it('is available on proxy class instance', () => {
          const { InstanceDescriptor } = createFixtures()[type]
          const proxy = createProxy(InstanceDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy />)
          wrapper.instance().something = 10
          expect(wrapper.instance()._something).toBe(20)
        })

        it('gets added', () => {
          const {
            InstanceDescriptor,
            InstanceDescriptorRemoval,
          } = createFixtures()[type]
          const proxy = createProxy(InstanceDescriptorRemoval)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy base={100} />)

          proxy.update(InstanceDescriptor)
          wrapper.instance().something = 10
          expect(wrapper.instance()._something).toBe(20)
        })

        it('gets replaced', () => {
          const {
            InstanceDescriptor,
            InstanceDescriptorUpdate,
            InstanceDescriptorRemoval,
          } = createFixtures()[type]
          const proxy = createProxy(InstanceDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy />)
          const instance = wrapper.instance()
          instance.something = 10
          expect(instance._something).toBe(20)

          proxy.update(InstanceDescriptorUpdate)
          expect(instance._something).toBe(20)
          instance.something = 10
          expect(instance._something).toBe(30)

          proxy.update(InstanceDescriptorRemoval)
          expect(instance._something).toBe(30)
          instance.something = 7
          expect(instance.something).toBe(7)
          expect(instance._something).toBe(30)
        })

        it('gets redefined', () => {
          const {
            InstanceDescriptor,
            InstanceDescriptorUpdate,
          } = createFixtures()[type]
          const proxy = createProxy(InstanceDescriptor)
          const Proxy = proxy.get()
          const wrapper = mount(<Proxy base={100} />)
          expect(wrapper.text()).toBe('142')

          Object.defineProperty(wrapper.instance(), 'something', {
            value: 50,
          })

          proxy.update(InstanceDescriptorUpdate)
          expect(wrapper.instance().something).toBe(50)
        })
      })
    })
  })
})
