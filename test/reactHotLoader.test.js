import React from 'react'
import { mount } from 'enzyme'
import { PROXY_KEY, UNWRAP_PROXY } from '../src/proxy/constants'
import { get as getGeneration } from '../src/global/generation'
import reactHotLoader from '../src/reactHotLoader'

describe('reactHotLoader', () => {
  let Div
  let Span

  beforeEach(() => {
    Div = () => <div />
    Span = () => <span />
    reactHotLoader.patch(React)
    reactHotLoader.reset()
  })

  describe('#patch', () => {
    let OriginalReactMock
    let ReactMock

    beforeEach(() => {
      OriginalReactMock = {
        createElement: jest.fn(),
        cloneElement: jest.fn(),
        createFactory: jest.fn(),
        Children: {
          only: jest.fn(x => x),
        },
      }
      ReactMock = { ...OriginalReactMock }
    })

    it('should patch all methods', () => {
      reactHotLoader.patch(ReactMock)
      expect(ReactMock.createElement.isPatchedByReactHotLoader).toBe(true)
      expect(ReactMock.cloneElement.isPatchedByReactHotLoader).toBe(true)
      expect(ReactMock.createFactory.isPatchedByReactHotLoader).toBe(true)
      expect(ReactMock.Children.only.isPatchedByReactHotLoader).toBe(true)
    })

    describe('#createElement', () => {
      it('should create a proxy and call original method with it', () => {
        reactHotLoader.patch(ReactMock)
        ReactMock.createElement(Div, { foo: 'bar' })
        const DivProxy = OriginalReactMock.createElement.mock.calls[0][0]
        expect(DivProxy[PROXY_KEY]).toBeDefined()
      })
    })

    describe('#createFactory', () => {
      it('should create a factory that returns proxy', () => {
        reactHotLoader.patch(ReactMock)
        const dummyFactory = ReactMock.createFactory(Div)
        dummyFactory({ foo: 'bar' })
        const DivProxy = OriginalReactMock.createElement.mock.calls[0][0]
        expect(DivProxy[PROXY_KEY]).toBeDefined()
      })
    })

    describe('#Children.only', () => {
      it('should returns a proxy', () => {
        reactHotLoader.patch(ReactMock)
        const children = { type: Div, props: { foo: 'bar' } }
        const result = ReactMock.Children.only(children)
        const DivProxy = result.type
        expect(DivProxy[PROXY_KEY]).toBeDefined()
      })
    })
  })

  describe('#reset', () => {
    it('should reset all proxies', () => {
      const proxyElement = React.createElement(Div, { foo: 'bar' })
      const secondProxyElement = React.createElement(Div, { foo: 'bar' })
      expect(proxyElement.type[PROXY_KEY]).toBe(
        secondProxyElement.type[PROXY_KEY],
      )

      // After that, a new proxy key should be generated
      // meaning that a new proxy has been created
      reactHotLoader.reset()
      const thirdProxyElement = React.createElement(Div, { foo: 'bar' })
      expect(proxyElement.type[PROXY_KEY]).not.toBe(
        thirdProxyElement.type[PROXY_KEY],
      )
    })
  })

  describe('#disableProxyCreation', () => {
    afterEach(() => {
      reactHotLoader.disableProxyCreation = false
    })

    it('should disable the creation of proxy', () => {
      reactHotLoader.disableProxyCreation = true
      const proxyElement = React.createElement(Div, { foo: 'bar' })
      expect(proxyElement.type[PROXY_KEY]).not.toBeDefined()
    })

    it('should still be possible to get existing proxies', () => {
      React.createElement(Div, { foo: 'bar' })
      reactHotLoader.disableProxyCreation = true
      const proxyElement = React.createElement(Div, { foo: 'bar' })
      expect(proxyElement.type[PROXY_KEY]).toBeDefined()
    })
  })

  describe('#register', () => {
    it('should increment update counter', () => {
      const oldGeneration = getGeneration()
      reactHotLoader.register(Div, 'Div', 'reactHotLoader.test.js')
      // new thing, no change
      expect(getGeneration()).toBe(oldGeneration + 0)

      reactHotLoader.register(Div, 'Div', 'reactHotLoader.test.js')
      // no replacement
      expect(getGeneration()).toBe(oldGeneration + 0)

      const NewDiv = () => <div />
      reactHotLoader.register(NewDiv, 'Div', 'reactHotLoader.test.js')
      // replacement!
      expect(getGeneration()).toBe(oldGeneration + 1)
    })

    it('should ignore dom elements and incomplete signature', () => {
      reactHotLoader.register(Div, 'Div', 'reactHotLoader.test.js')
      reactHotLoader.register('div', 'Div', 'reactHotLoader.test.js')
      reactHotLoader.register(Span, 'Div')
      reactHotLoader.register(Span, '')
      reactHotLoader.register(Span, '', '')
      const proxyElement = React.createElement(Div)
      expect(proxyElement.type[UNWRAP_PROXY]()).toBe(Div)
    })

    it('should update proxy', () => {
      reactHotLoader.register(Div, 'Div', 'reactHotLoader.test.js')
      const proxyElement = React.createElement(Div)
      expect(proxyElement.type[UNWRAP_PROXY]()).toBe(Div)

      reactHotLoader.register(Span, 'Div', 'reactHotLoader.test.js')
      expect(proxyElement.type[UNWRAP_PROXY]()).toBe(Span)
    })

    it('should not double-proxy', () => {
      const Component1 = () => <div>42</div>
      const Element1 = <Component1 />
      const Type1 = Element1.type
      const Element2 = <Type1 />
      const Element3 = React.Children.only(Element1)
      const Element4 = React.cloneElement(Element1)
      expect(Element1.type).toBe(Element2.type)
      expect(Element1.type).toBe(Element3.type)
      expect(Element1.type).toBe(Element4.type)
    })

    it('should result into shadowing the original component', () => {
      // Registering Div
      reactHotLoader.register(Div, 'Div', 'reactHotLoader.test.js')

      // Creating a Div element, proxy of Div is used
      let proxyElement = React.createElement(Div)
      let wrapper = mount(proxyElement)
      expect(wrapper.html()).toBe('<div></div>')

      // Register the same component but with a Span
      reactHotLoader.register(Span, 'Div', 'reactHotLoader.test.js')

      // Creating a Div element, proxy of Span is used
      proxyElement = React.createElement(Div)
      wrapper = mount(proxyElement)
      expect(wrapper.html()).toBe('<span></span>')
    })
  })
})
