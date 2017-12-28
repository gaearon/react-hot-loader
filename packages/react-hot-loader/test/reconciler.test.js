/* eslint-env jest */

import React, { Component } from 'react'
import Adapter from 'enzyme-adapter-react-16'
import { mount, configure } from 'enzyme'
import '../src/patch.dev'
import AppContainer from '../src/AppContainer.dev'
import { didUpdate } from '../src/updateCounter'
import getReactStack from '../src/internal/getReactStack'
import { areComponentsEqual } from '../src/utils.dev'
import RHL from '../src/reactHotLoader'

configure({ adapter: new Adapter() })

const createTestDouble = (render, name, key) => {
  const mounted = jest.fn()
  const unmounted = jest.fn()

  class TestingComponent extends Component {
    componentWillMount() {
      mounted()
    }

    componentWillUnmount() {
      unmounted()
    }

    /* eslint-disable */
    __reactstandin__regenerateByEval(key, code) {
      this[key] = eval(code)
    }
    /* eslint-enable */

    render() {
      return render(this.props)
    }
  }

  if (name) {
    TestingComponent.displayName = name
  }
  return {
    Component: TestingComponent,
    mounted,
    unmounted,
    key,
  }
}

describe('reconciler', () => {
  describe('Application', () => {
    it('should regenerate internal component', () => {
      const ComponentRoot = createTestDouble(
        ({ children }) => <div>{children}</div>,
        'root',
        'root',
      )

      const Component1 = createTestDouble(
        ({ children }) => <b>{children}</b>,
        'test',
        '1',
      )
      const Component2 = createTestDouble(() => <u>REPLACED</u>, 'test', '2')
      const Component3 = createTestDouble(
        () => <u>NEW ONE</u>,
        'somethingElse',
        '3',
      )

      let currentComponent = Component1
      const ComponentSwap = props => {
        const { Component } = currentComponent
        return (
          <blockquote>
            <Component {...props} />
          </blockquote>
        )
      }

      const App = () => (
        <ComponentRoot.Component>
          <ComponentSwap>42</ComponentSwap>
        </ComponentRoot.Component>
      )

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )

      // mount and perform first checks
      expect(wrapper.find(<Component1.Component />.type).length).toBe(1)
      expect(ComponentRoot.mounted).toHaveBeenCalledTimes(1)
      expect(Component1.mounted).toHaveBeenCalledTimes(1)

      // replace with `the same` component
      currentComponent = Component2
      // they are different
      expect(
        areComponentsEqual(Component1.Component, Component2.Component),
      ).toBe(false)
      didUpdate()
      wrapper.setProps({ update: 'now' })
      // not react-stand-in merge them together
      expect(
        areComponentsEqual(Component1.Component, Component2.Component),
      ).toBe(true)
      expect(wrapper.find(<Component1.Component />.type).length).toBe(1)
      expect(wrapper.find(<Component2.Component />.type).length).toBe(1)

      expect(ComponentRoot.mounted).toHaveBeenCalledTimes(1)
      expect(Component1.unmounted).toHaveBeenCalledTimes(0)
      expect(Component2.mounted).toHaveBeenCalledTimes(0)

      // replace with a different component
      currentComponent = Component3
      didUpdate()
      wrapper.setProps({ update: 'now' })
      expect(wrapper.find(<Component3.Component />.type).length).toBe(1)
      // Component1 will never be unmounted
      expect(Component1.unmounted).toHaveBeenCalledTimes(0)
      expect(Component2.unmounted).toHaveBeenCalledTimes(1)
      expect(Component3.mounted).toHaveBeenCalledTimes(1)

      expect(
        areComponentsEqual(Component1.Component, Component3.Component),
      ).toBe(false)
      expect(
        areComponentsEqual(Component2.Component, Component3.Component),
      ).toBe(false)
    })

    it('should regenerate internal component', () => {
      const Component1 = createTestDouble(
        ({ children }) => <b>{children}</b>,
        'test',
        '1',
      )
      const Component2 = createTestDouble(() => <u>REPLACED</u>, 'test', '2')

      let currentComponent = Component1
      const ComponentSwap = props => {
        const { Component } = currentComponent
        return (
          <blockquote>
            <Component {...props} />
          </blockquote>
        )
      }

      const App = () => (
        <div>
          <h1>working</h1>
          <ComponentSwap>
            <ComponentSwap>42</ComponentSwap>
          </ComponentSwap>
        </div>
      )

      const wrapper = mount(
        <AppContainer reconciler>
          <App />
        </AppContainer>,
      )

      currentComponent = Component2
      didUpdate()
      wrapper.setProps({ update: 'now' })

      expect(Component1.unmounted).toHaveBeenCalledTimes(0)
      expect(Component2.mounted).toHaveBeenCalledTimes(0)
    })

    it('should handle function as a child', () => {
      const Component1 = createTestDouble(
        ({ children }) => <b>{children(0)}</b>,
        'test',
        '1',
      )
      const Component2 = createTestDouble(
        ({ children }) => <u>{children(1)}</u>,
        'test',
        '2',
      )

      let currentComponent = Component1
      const ComponentSwap = props => {
        const { Component } = currentComponent
        return (
          <blockquote>
            <Component {...props} />
          </blockquote>
        )
      }

      const App = () => (
        <div>
          <h1>working</h1>
          <ComponentSwap>{x => 42 + x}</ComponentSwap>
        </div>
      )

      const wrapper = mount(
        <AppContainer reconciler>
          <App />
        </AppContainer>,
      )

      expect(wrapper.text()).toContain(42)

      currentComponent = Component2
      didUpdate()
      wrapper.setProps({ update: 'now' })

      expect(Component1.unmounted).toHaveBeenCalledTimes(0)
      expect(Component2.mounted).toHaveBeenCalledTimes(0)
      expect(wrapper.text()).toContain(43)
    })
  })

  describe('hydrate', () => {
    it('should hydrate', () => {
      const Transform = ({ children }) => <section>42 + {children}</section>
      const One = ({ children }) => <section>1 == {children(1)}</section>

      RHL.config.disableComponentProxy = true
      const wrapper = mount(
        <AppContainer reconciler>
          <div>
            <div>
              <Transform>
                <div>
                  <div>42</div>
                </div>
              </Transform>
            </div>
            <div>
              <One>{one => one}</One>
            </div>
            <div>
              the lazy brown fox
              <p>jumped over the hedge</p>
            </div>
          </div>
        </AppContainer>,
      )
      RHL.config.disableComponentProxy = false
      const { instance, children } = getReactStack(wrapper.instance())
      expect(children).toMatchSnapshot()
      expect(instance).not.toBe(null)
    })
  })
})
