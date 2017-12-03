/* eslint-env jest */
/* eslint-disable react/no-render-return-value */
import React from 'react'
import ReactDOM from 'react-dom'
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
  let warnSpy
  let element
  let fixtures = createFixtures()

  beforeEach(() => {
    element = document.createElement('div')
    fixtures = createFixtures()
    warnSpy = jest.spyOn(console, 'warn')
  })

  afterEach(() => {
    expect(warnSpy).not.toHaveBeenCalled()
  })

  Object.keys(fixtures).forEach(type => {
    describe(type, () => {
      it('happens without proxy', () => {
        const { Bar, Baz } = fixtures[type]
        const barInstance = ReactDOM.render(<Bar />, element)
        expect(element.innerHTML).toBe('<div>Bar</div>')
        const bazInstance = ReactDOM.render(<Baz />, element)
        expect(element.innerHTML).toBe('<div>Baz</div>')
        expect(barInstance).not.toBe(bazInstance)
        expect(barInstance.didUnmount).toBe(true)
      })

      it('does not happen when rendering new proxied versions', () => {
        const { Bar, Baz, Foo } = fixtures[type]
        const proxy = createProxy(Bar)
        const BarProxy = proxy.get()
        const barInstance = ReactDOM.render(<BarProxy />, element)
        expect(element.innerHTML).toBe('<div>Bar</div>')
        expect(barInstance.didUnmount).toBe(undefined)

        proxy.update(Baz)
        const BazProxy = proxy.get()
        const bazInstance = ReactDOM.render(<BazProxy />, element)
        expect(element.innerHTML).toBe('<div>Baz</div>')
        expect(bazInstance).toBe(bazInstance)
        expect(barInstance.didUnmount).toBe(undefined)

        proxy.update(Foo)
        const FooProxy = proxy.get()
        const fooInstance = ReactDOM.render(<FooProxy />, element)
        expect(element.innerHTML).toBe('<div>Foo</div>')
        expect(barInstance).toBe(fooInstance)
        expect(barInstance.didUnmount).toBe(undefined)
      })

      it('does not happen when rendering old proxied versions', () => {
        const { Bar, Baz, Foo } = fixtures[type]
        const proxy = createProxy(Bar)
        const Proxy = proxy.get()
        const barInstance = ReactDOM.render(<Proxy />, element)
        expect(element.innerHTML).toBe('<div>Bar</div>')
        expect(barInstance.didUnmount).toBe(undefined)

        proxy.update(Baz)
        const bazInstance = ReactDOM.render(<Proxy />, element)
        expect(element.innerHTML).toBe('<div>Baz</div>')
        expect(barInstance).toBe(bazInstance)
        expect(barInstance.didUnmount).toBe(undefined)

        proxy.update(Foo)
        const fooInstance = ReactDOM.render(<Proxy />, element)
        expect(element.innerHTML).toBe('<div>Foo</div>')
        expect(barInstance).toBe(fooInstance)
        expect(barInstance.didUnmount).toBe(undefined)
      })
    })
  })
})
