/* eslint-env jest */

import React, { Component } from 'react'
import { mount } from 'enzyme'
import '../src/patch.dev'
import AppContainer from '../src/AppContainer.dev'
import { didUpdate } from '../src/updateCounter'
import getReactStack from '../src/internal/getReactStack'
import { areComponentsEqual } from '../src/utils.dev'
import RHL from '../src/reactHotLoader'

const spyComponent = (render, displayName, key) => {
  const mounted = jest.fn()
  const unmounted = jest.fn()
  const willUpdate = jest.fn()

  class TestingComponent extends Component {
    componentWillMount() {
      mounted()
    }

    componentWillUpdate(nextProps, nextState) {
      willUpdate(nextProps, nextState, this.props, this.state)
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

  if (displayName) {
    TestingComponent.displayName = displayName
  }

  return {
    Component: TestingComponent,
    willUpdate,
    mounted,
    unmounted,
    key,
  }
}

describe('reconciler', () => {
  describe('Application', () => {
    it('should regenerate internal component', () => {
      const root = spyComponent(
        ({ children }) => <div>{children}</div>,
        'root',
        'root',
      )

      const first = spyComponent(
        ({ children }) => <b>{children}</b>,
        'test',
        '1',
      )
      const second = spyComponent(() => <u>REPLACED</u>, 'test', '2')
      const third = spyComponent(() => <u>NEW ONE</u>, 'somethingElse', '3')

      let currentComponent = first
      const currentProps = {}

      const ComponentSwap = props => {
        const { Component } = currentComponent
        return (
          <blockquote>
            <Component {...props} {...currentProps} />
          </blockquote>
        )
      }

      const App = () => (
        <root.Component>
          <ComponentSwap>42</ComponentSwap>
        </root.Component>
      )

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )

      // mount and perform first checks
      expect(wrapper.find(<first.Component />.type).length).toBe(1)
      expect(root.mounted).toHaveBeenCalledTimes(1)
      expect(first.mounted).toHaveBeenCalledTimes(1)

      // replace with `the same` component
      currentComponent = second
      // they are different
      expect(areComponentsEqual(first.Component, second.Component)).toBe(false)

      currentProps.newProp = true
      didUpdate()
      wrapper.setProps({ update: 'now' })
      // not react-stand-in merge them together
      expect(areComponentsEqual(first.Component, second.Component)).toBe(true)
      expect(wrapper.find(<first.Component />.type).length).toBe(1)
      expect(wrapper.find(<second.Component />.type).length).toBe(1)

      expect(root.mounted).toHaveBeenCalledTimes(1)
      expect(first.unmounted).toHaveBeenCalledTimes(0)
      expect(second.mounted).toHaveBeenCalledTimes(0)
      expect(second.willUpdate).toHaveBeenCalledTimes(2)
      expect(second.willUpdate.mock.calls[0]).toEqual([
        { children: '42' },
        null,
        { children: '42' },
        null,
      ])
      expect(second.willUpdate.mock.calls[1]).toEqual([
        { children: '42', newProp: true },
        null,
        { children: '42' },
        null,
      ])

      // replace with a different component
      currentComponent = third
      didUpdate()
      wrapper.setProps({ update: 'now' })
      expect(wrapper.find(<third.Component />.type).length).toBe(1)
      // first will never be unmounted
      expect(first.unmounted).toHaveBeenCalledTimes(0)
      expect(second.unmounted).toHaveBeenCalledTimes(1)
      expect(third.mounted).toHaveBeenCalledTimes(1)

      expect(areComponentsEqual(first.Component, third.Component)).toBe(false)
      expect(areComponentsEqual(second.Component, third.Component)).toBe(false)
    })

    it('should regenerate internal component', () => {
      const first = spyComponent(
        ({ children }) => <b>{children}</b>,
        'test',
        '1',
      )

      const second = spyComponent(() => <u>REPLACED</u>, 'test', '2')

      let currentComponent = first

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
        <AppContainer>
          <App />
        </AppContainer>,
      )

      currentComponent = second
      didUpdate()
      wrapper.setProps({ update: 'now' })

      expect(first.unmounted).toHaveBeenCalledTimes(0)
      expect(second.mounted).toHaveBeenCalledTimes(0)
    })

    it('should handle function as a child', () => {
      const first = spyComponent(
        ({ children }) => <b>{children(0)}</b>,
        'test',
        '1',
      )
      const second = spyComponent(
        ({ children }) => <u>{children(1)}</u>,
        'test',
        '2',
      )

      let currentComponent = first
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
        <AppContainer>
          <App />
        </AppContainer>,
      )

      expect(wrapper.text()).toContain(42)

      currentComponent = second
      didUpdate()
      wrapper.setProps({ update: 'now' })

      expect(first.unmounted).toHaveBeenCalledTimes(0)
      expect(second.mounted).toHaveBeenCalledTimes(0)
      expect(wrapper.text()).toContain(43)
    })
  })

  describe('hydrate', () => {
    it('should hydrate', () => {
      const Transform = ({ children }) => <section>42 + {children}</section>
      const One = ({ children }) => <section>1 == {children(1)}</section>

      RHL.disableProxyCreation = true
      const wrapper = mount(
        <AppContainer>
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
      RHL.disableProxyCreation = false
      const { instance, children } = getReactStack(wrapper.instance())
      expect(children).toMatchSnapshot()
      expect(instance).not.toBe(null)
    })
  })
})
