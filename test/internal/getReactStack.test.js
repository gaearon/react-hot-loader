import React from 'react'
import { mount } from 'enzyme'
import getReactStack from '../../src/internal/getReactStack'

const getInstanceOf = element => {
  let instance
  class Root extends React.Component {
    render() {
      instance = this
      return element
    }
  }
  mount(<Root />)
  return { instance, Root }
}

describe('getReactStack', () => {
  it('should generate React stack from instance', () => {
    const { instance, Root } = getInstanceOf(<div />)
    const stack = getReactStack(instance)
    expect(stack.type).toBe(Root)
    expect(stack.instance).toBeInstanceOf(Root)
    expect(stack.children).toHaveLength(1)
    expect(stack.children[0].type).toBe('div')
    expect(stack.children[0].instance).toBeDefined()
    expect(stack.children[0].children).toHaveLength(0)
  })

  it('should handle components', () => {
    const Div = () => <div />
    const { instance, Root } = getInstanceOf(<Div />)
    const stack = getReactStack(instance)
    expect(stack.type).toBe(Root)
    expect(stack.instance).toBeInstanceOf(Root)
    expect(stack.children).toHaveLength(1)
    expect(stack.children[0].type).toBe(Div)
    expect(stack.children[0].instance).toBeDefined()
    expect(stack.children[0].children).toHaveLength(1)
    expect(stack.children[0].children[0].type).toBe('div')
    expect(stack.children[0].children[0].instance).toBeDefined()
    expect(stack.children[0].children[0].children).toHaveLength(0)
  })

  if (React.version.startsWith('16')) {
    it('should handle multiple children (only Fiber)', () => {
      const Div = () => <div />
      const { instance, Root } = getInstanceOf([
        <Div key="A" />,
        <Div key="B" />,
      ])
      const stack = getReactStack(instance)
      expect(stack.type).toBe(Root)
      expect(stack.instance).toBeInstanceOf(Root)
      expect(stack.children).toHaveLength(2)
      function expectToBeDivStack(child) {
        expect(child.type).toBe(Div)
        expect(child.instance.SFC_fake).toBe(true)
        expect(child.children).toHaveLength(1)
        expect(child.children[0].type).toBe('div')
        expect(child.children[0].instance).toBeDefined()
        expect(child.children[0].children).toHaveLength(0)
      }
      expectToBeDivStack(stack.children[0])
      expectToBeDivStack(stack.children[1])
    })
  }

  it('should handle complex structure', () => {
    class A extends React.Component {
      render() {
        return <div />
      }
    }

    class B extends React.Component {
      render() {
        return <A />
      }
    }

    const { instance, Root } = getInstanceOf(
      <div>
        <A key="A" />
        <B key="B" />
      </div>,
    )

    const stack = getReactStack(instance)
    expect(stack.type).toBe(Root)
    expect(stack.instance).toBeInstanceOf(Root)
    expect(stack.children).toHaveLength(1)
    expect(stack.children[0].type).toBe('div')
    expect(stack.children[0].children).toHaveLength(2)

    function expectToBeAStack(child) {
      expect(child.type).toBe(A)
      expect(child.instance).toBeInstanceOf(A)
      expect(child.children).toHaveLength(1)
      expect(child.children[0].type).toBe('div')
      expect(child.children[0].instance).toBeDefined()
      expect(child.children[0].children).toHaveLength(0)
    }

    function expectToBeBStack(child) {
      expect(child.type).toBe(B)
      expect(child.instance).toBeInstanceOf(B)
      expect(child.children).toHaveLength(1)
      expectToBeAStack(child.children[0])
    }

    expectToBeAStack(stack.children[0].children[0])
    expectToBeBStack(stack.children[0].children[1])
  })
})
