/* eslint-env jest */
/* eslint-disable react/no-render-return-value */
import React from 'react'
import { ensureNoWarnings, createMounter } from './helper'
import createProxy from '../src'

const createFixtures = () => ({
  modern: {
    Bar: class Bar extends React.Component {
      componentWillUnmount() {
        this.didUnmount = true
      }

      render() {
        return <div>Bar</div>
      }
    },

    Baz: class Baz extends React.Component {
      componentWillUnmount() {
        this.didUnmount = true
      }

      render() {
        return <div>Baz</div>
      }
    },

    Foo: class Foo extends React.Component {
      componentWillUnmount() {
        this.didUnmount = true
      }

      render() {
        return <div>Foo</div>
      }
    },
  },
})

describe('unmounting', () => {
  let fixtures = createFixtures()
  ensureNoWarnings()
  const { mount } = createMounter()

  beforeEach(() => {
    fixtures = createFixtures()
  })

  Object.keys(fixtures).forEach(type => {
    describe(type, () => {
      it('happens without proxy', () => {
        const { Bar, Baz } = fixtures[type]
        const barWrapper = mount(<Bar />)
        const barInstance = barWrapper.instance()
        expect(barWrapper.text()).toBe('Bar')
        const bazWrapper = mount(<Baz />)
        const bazInstance = bazWrapper.instance()
        expect(bazWrapper.text()).toBe('Baz')
        expect(barInstance).not.toBe(bazInstance)
        expect(barInstance.didUnmount).toBe(true)
      })

      it('does not happen when rendering new proxied versions', () => {
        const { Bar, Baz, Foo } = fixtures[type]
        const proxy = createProxy(Bar)
        const BarProxy = proxy.get()
        const barWrapper = mount(<BarProxy />)
        const barInstance = barWrapper.instance()
        expect(barWrapper.text()).toBe('Bar')
        expect(barInstance.didUnmount).toBe(undefined)

        proxy.update(Baz)
        const BazProxy = proxy.get()
        const bazWrapper = mount(<BazProxy />)
        const bazInstance = bazWrapper.instance()
        expect(bazWrapper.text()).toBe('Baz')
        expect(barInstance).toBe(bazInstance)
        expect(barInstance.didUnmount).toBe(undefined)

        proxy.update(Foo)
        const FooProxy = proxy.get()
        const fooWrapper = mount(<FooProxy />)
        const fooInstance = fooWrapper.instance()
        expect(fooWrapper.text()).toBe('Foo')
        expect(barInstance).toBe(fooInstance)
        expect(barInstance.didUnmount).toBe(undefined)
      })

      it('does not happen when rendering old proxied versions', () => {
        const { Bar, Baz, Foo } = fixtures[type]
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()
        const barWrapper = mount(<Proxy />)
        expect(barWrapper.text()).toBe('Bar')
        expect(barWrapper.instance().didUnmount).toBe(undefined)

        proxy.update(Baz)
        const bazWrapper = mount(<Proxy />)
        expect(bazWrapper.text()).toBe('Baz')
        expect(barWrapper.instance()).toBe(bazWrapper.instance())
        expect(barWrapper.instance().didUnmount).toBe(undefined)

        proxy.update(Foo)
        const fooWrapper = mount(<Proxy />)
        expect(fooWrapper.text()).toBe('Foo')
        expect(barWrapper.instance()).toBe(fooWrapper.instance())
        expect(barWrapper.instance().didUnmount).toBe(undefined)
      })
    })
  })
})
