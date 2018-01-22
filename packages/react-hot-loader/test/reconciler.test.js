import React, { Component } from 'react'
import { mount } from 'enzyme'
import '../src/patch.dev'
import AppContainer from '../src/AppContainer.dev'
import { increment as incrementGeneration } from '../src/global/generation'
import { areComponentsEqual } from '../src/utils.dev'
import logger from '../src/logger'
import reactHotLoader from '../src/reactHotLoader'

jest.mock('../src/logger')

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
      incrementGeneration()
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
      incrementGeneration()
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
      incrementGeneration()
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
      incrementGeneration()
      wrapper.setProps({ update: 'now' })

      expect(first.unmounted).toHaveBeenCalledTimes(0)
      expect(second.mounted).toHaveBeenCalledTimes(0)
      expect(wrapper.text()).toContain(43)
    })

    it('should handle error on render', () => {
      const App = () => <div>Normal application</div>
      reactHotLoader.register(App, 'App', 'test.js')

      const TestCase = props => (
        <AppContainer>
          <App {...props} />
        </AppContainer>
      )

      const wrapper = mount(<TestCase />)

      {
        const App = ({ update = '42' }) => (
          <div>
            Normal application{' '}
            <span>{update ? update.not.existing : '42'}</span>
          </div>
        )
        reactHotLoader.register(App, 'App', 'test.js')

        expect(() => wrapper.setProps({ children: <App /> })).toThrow()
        expect(reactHotLoader.disableProxyCreation).toBe(false)
      }

      expect(logger.warn).toHaveBeenCalledWith(
        `React-hot-loader: reconcilation failed due to error`,
        expect.any(Error),
      )
    })
  })
})
