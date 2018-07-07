import React from 'react'
import { mount } from 'enzyme'
import {
  isCompositeComponent,
  getComponentDisplayName,
  getInternalInstance,
  updateInstance,
  isReactClass,
  isReactClassInstance,
} from '../../src/internal/reactUtils'

describe('reactUtils', () => {
  describe('isReact', () => {
    it('isReactClass', () => {
      class C1 extends React.Component {}
      class C2 extends C1 {}
      const F1 = () => 42

      expect(isReactClass(F1)).toBe(false)
      expect(isReactClass(C1)).toBe(true)
      expect(isReactClass(C2)).toBe(true)
    })

    it('isReactClassInstance', () => {
      class C1 extends React.Component {}
      class C2 extends C1 {}
      const F1 = function F1() {}

      expect(isReactClassInstance(new F1())).toBe(false)
      expect(isReactClassInstance(new C1())).toBe(true)
      expect(isReactClassInstance(new C2())).toBe(true)
    })
  })

  describe('#isCompositeComponent', () => {
    it('should return true if this is a composite component', () => {
      const FunctionalComponent = () => null
      class ClassComponent extends React.Component {
        render() {
          return null
        }
      }
      expect(isCompositeComponent('div')).toBe(false)
      expect(isCompositeComponent(ClassComponent)).toBe(true)
      expect(isCompositeComponent(FunctionalComponent)).toBe(true)
    })
  })

  describe('#getComponentDisplayName', () => {
    it('should return displayName if specified', () => {
      const ComponentWithDisplayName = () => null
      ComponentWithDisplayName.displayName = 'CustomDisplayName'
      expect(getComponentDisplayName(ComponentWithDisplayName)).toBe(
        'CustomDisplayName',
      )
    })

    it('should return name either', () => {
      const ComponentWithoutDisplayName = () => null
      expect(getComponentDisplayName(ComponentWithoutDisplayName)).toBe(
        'ComponentWithoutDisplayName',
      )
    })

    it('should return "Component" either', () => {
      expect(getComponentDisplayName('div')).toBe('Component')
    })
  })

  describe('#getInternalInstance', () => {
    it('should return internal instance', () => {
      let instance
      class Component extends React.Component {
        render() {
          instance = this
          return null
        }
      }
      mount(<Component />)
      if (React.version === '16') {
        expect(getInternalInstance(instance).constructor.name).toBe('FiberNode')
      } else if (React.version === '15') {
        expect(getInternalInstance(instance).constructor.name).toBe(
          'ReactCompositeComponentWrapper',
        )
      }
    })
  })

  describe('#updateInstance', () => {
    it('should call forceUpdate', () => {
      let instance
      class Component extends React.Component {
        render() {
          instance = this
          return null
        }
      }
      mount(<Component />)
      instance.forceUpdate = jest.fn()
      updateInstance(instance)
      expect(instance.forceUpdate).toHaveBeenCalled()
    })
  })
})
