import React, { Component } from 'react'
import reactHotLoader from '../src/reactHotLoader'
import { areComponentsEqual } from '../src/utils.dev'

reactHotLoader.patch(React)

describe('utils (dev)', () => {
  describe('areComponentsEqual', () => {
    const createClasses = () => {
      class Component1 extends Component {
        render() {
          return 42
        }
      }

      class Component2 extends Component {
        render() {
          return 43
        }
      }

      return { Component1, Component2 }
    }

    const createStateless = () => {
      const Component1 = () => 42
      const Component2 = () => 43
      return { Component1, Component2 }
    }

    const testSuite = factory => {
      it('should compare non-registred components', () => {
        const { Component1, Component2 } = factory()

        const element1 = <Component1 />
        const element2 = <Component2 />

        expect(Component1 === Component2).toBe(false)
        expect(Component1 === element1.type).toBe(false)

        expect(areComponentsEqual(Component1, element1.type)).toBe(true)
        expect(areComponentsEqual(Component1, element2.type)).toBe(false)
      })

      it('should compare registered components', () => {
        const { Component1, Component2 } = factory()

        reactHotLoader.register(Component1, 'Class1', 'util.dev')
        reactHotLoader.register(Component2, 'Class2', 'util.dev')

        const element1 = <Component1 />
        const element2 = <Component2 />

        expect(Component1 === Component2).toBe(false)
        expect(Component1 === element1.type).toBe(false)

        expect(areComponentsEqual(Component1, element1.type)).toBe(true)
        expect(areComponentsEqual(Component1, element2.type)).toBe(false)
      })
    }

    describe('class based', () => testSuite(createClasses))

    describe('function based', () => testSuite(createStateless))
  })
})
