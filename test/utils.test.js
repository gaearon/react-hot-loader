import React, { Component } from 'react'
import reactHotLoader from '../src/reactHotLoader'
import { areComponentsEqual, cold } from '../src/utils.dev'
import configuration from '../src/configuration'
import logger from '../src/logger'

reactHotLoader.patch(React)

jest.mock('../src/logger')

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

  describe('cold', () => {
    it('should disable RHL for "cold" Components', () => {
      const Component1 = () => <div>42</div>
      const Component2 = () => <div>42</div>

      reactHotLoader.register(Component1, 'Class1', 'util.dev')
      reactHotLoader.register(Component2, 'Class2', 'util.dev')

      cold(Component1)

      const element1 = <Component1 />
      const element2 = <Component2 />

      expect(Component1 === element1.type).toBe(true)
      expect(Component2 === element2.type).toBe(false)

      expect(areComponentsEqual(Component1, element1.type)).toBe(true)
      expect(areComponentsEqual(Component2, element2.type)).toBe(true)
    })

    it('should components by fileName', () => {
      const Component1 = () => <div>42</div>
      const Component2 = () => <div>42</div>

      configuration.onComponentRegister = (type, name, file) => {
        if (file === 'oneFile') cold(type)
      }

      reactHotLoader.register(Component1, 'Class1', 'oneFile')
      reactHotLoader.register(Component2, 'Class2', 'anotherFile')

      const element1 = <Component1 />
      const element2 = <Component2 />

      expect(Component1 === element1.type).toBe(true)
      expect(Component2 === element2.type).toBe(false)

      expect(areComponentsEqual(Component1, element1.type)).toBe(true)
      expect(areComponentsEqual(Component2, element2.type)).toBe(true)
    })

    it('should report on cold update', () => {
      const Component1 = () => <div>42</div>
      const Component2 = () => <div>42</div>
      cold(Component1)
      // cold(Component2)
      reactHotLoader.register(Component1, 'Cold', 'Winter')
      reactHotLoader.register(Component1, 'Cold', 'Winter')
      // first registration is expected
      expect(logger.error).not.toHaveBeenCalled()

      reactHotLoader.register(Component2, 'Cold', 'Winter')
      expect(logger.error).toHaveBeenCalledWith(
        `React-hot-loader: Cold component`,
        'Cold',
        'at',
        'Winter',
        'has been updated',
      )
    })
  })
})
