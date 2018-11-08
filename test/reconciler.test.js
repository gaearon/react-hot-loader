import React, { Component } from 'react'
import { mount } from 'enzyme'
import TestRenderer from 'react-test-renderer'
import { AppContainer } from '../src/index.dev'
import { increment as incrementGeneration } from '../src/global/generation'
import { areComponentsEqual } from '../src/utils.dev'
import logger from '../src/logger'
import reactHotLoader from '../src/reactHotLoader'
import configuration from '../src/configuration'

jest.mock('../src/logger')

const spyComponent = (render, displayName, key) => {
  const mounted = jest.fn()
  const unmounted = jest.fn()
  const willUpdate = jest.fn()
  const rendered = jest.fn()

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
      rendered()
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
    rendered,
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
        ({ children }) => <b>FIRST {children}</b>,
        'test',
        '1',
      )
      const second = spyComponent(() => <u>REPLACED</u>, 'test', '2')
      const third = spyComponent(() => <u>NEW ONE</u>, 'somethingElse', '3')

      let currentComponent = first
      const currentProps = {}
      let renderTick = 0

      const ComponentSwap = props => {
        const { Component, key } = currentComponent
        return (
          <blockquote>
            <Component {...props} {...currentProps} keyId={key} />
            <div>
              {key} + {renderTick++}
            </div>
          </blockquote>
        )
      }

      const App = () => (
        <root.Component>
          <ComponentSwap>42</ComponentSwap>
        </root.Component>
      )
      App.contextTypes = {}

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )

      // mount and perform first checks
      expect(wrapper.find(<first.Component />.type).length).toBe(1)
      expect(root.mounted).toHaveBeenCalledTimes(1)
      expect(first.mounted).toHaveBeenCalledTimes(1)
      expect(wrapper.text()).toMatch(/FIRST/)

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
      expect(wrapper.text()).not.toMatch(/FIRST/)
      expect(wrapper.text()).toMatch(/REPLACED/)

      expect(root.mounted).toHaveBeenCalledTimes(1)
      expect(first.unmounted).toHaveBeenCalledTimes(0)
      expect(second.mounted).toHaveBeenCalledTimes(0)
      expect(second.willUpdate).toHaveBeenCalledTimes(2)

      // what props should be used? Look like the new ones
      expect(second.willUpdate.mock.calls[0]).toEqual([
        { children: '42', keyId: '1' },
        null,
        { children: '42', keyId: '1' },
        null,
      ])

      expect(second.willUpdate.mock.calls[1]).toEqual([
        { children: '42', newProp: true, keyId: '2' },
        null,
        { children: '42', keyId: '1' },
        null,
      ])

      // replace with a different component
      currentComponent = third
      incrementGeneration()
      wrapper.setProps({ update: 'now' })

      expect(wrapper.update().find(<third.Component />.type).length).toBe(1)
      // first will never be unmounted
      expect(first.unmounted).toHaveBeenCalledTimes(0)
      expect(second.unmounted).toHaveBeenCalledTimes(1)
      expect(third.mounted).toHaveBeenCalledTimes(1)

      expect(areComponentsEqual(first.Component, third.Component)).toBe(false)
      expect(areComponentsEqual(second.Component, third.Component)).toBe(false)
    })

    it('should hot-swap only internal components', () => {
      let An0
      let An1
      let Bn0
      let Bn1
      let App
      {
        const A = () => <div>A</div>
        const B = () => <div>A</div>
        App = () => (
          <div>
            <A />
            <B />
          </div>
        )
        An0 = A
        Bn0 = B
        reactHotLoader.register(App, 'App', 'test-hot-swap.js')
        reactHotLoader.register(B, 'B0', 'test-hot-swap.js')
      }
      const wrapper = mount(
        <div>
          <App />
        </div>,
      )
      {
        const A = () => <div>A</div>
        const B = () => <div>A</div>
        App = () => (
          <div>
            <A />
            <B />
          </div>
        )
        An1 = A
        Bn1 = B
        reactHotLoader.register(App, 'App', 'test-hot-swap.js')
        reactHotLoader.register(B, 'B1', 'test-hot-swap.js')
      }
      incrementGeneration()
      wrapper.setProps({ update: 'now' })

      // A-s are similar, and got merged
      expect(<An0 />.type).toEqual(<An1 />.type)
      // B-s are simlar, but known to be different types - not merged
      expect(<Bn0 />.type).not.toEqual(<Bn1 />.type)
    })

    it('should regenerate internal component without AppContainer', () => {
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
        // <AppContainer> ensure - there is no AppContainer
        <App />,
        // </AppContainer>,
      )

      expect(wrapper.html()).not.toContain('REPLACED')

      currentComponent = second
      incrementGeneration()
      wrapper.setProps({ update: 'now' })

      expect(wrapper.html()).toContain('REPLACED')

      expect(first.unmounted).toHaveBeenCalledTimes(0)
      expect(second.mounted).toHaveBeenCalledTimes(0)
    })

    it('should use new children branch during reconcile', () => {
      const First = spyComponent(() => <u>1</u>, 'test', '1')
      const Second = spyComponent(() => <u>2</u>, 'test', '2')

      const App = ({ second }) => (
        <div>
          <div>
            <First.Component />
            {second && <Second.Component />}
          </div>
        </div>
      )

      const Mounter = ({ second }) => <App second={second} />
      Mounter.contextTypes = {}

      const wrapper = mount(<Mounter second />)

      expect(First.rendered).toHaveBeenCalledTimes(1)
      expect(Second.rendered).toHaveBeenCalledTimes(1)

      incrementGeneration()
      wrapper.setProps({ update: 'now' })
      expect(First.rendered).toHaveBeenCalledTimes(3)
      expect(Second.rendered).toHaveBeenCalledTimes(3)

      incrementGeneration()
      wrapper.setProps({ second: false })
      expect(First.rendered).toHaveBeenCalledTimes(5)
      expect(Second.rendered).toHaveBeenCalledTimes(3)

      expect(First.unmounted).toHaveBeenCalledTimes(0)
      expect(Second.unmounted).toHaveBeenCalledTimes(1)
    })

    it('should use new children branch during reconcile for full components', () => {
      const First = spyComponent(() => <u>1</u>, 'test', '1')
      const Second = spyComponent(() => <u>2</u>, 'test', '2')

      const Section = ({ children }) => <div>{children}</div>

      const App = ({ second }) => (
        <div>
          <div>
            <Section>
              <First.Component />
              {second && <Second.Component />}
            </Section>
          </div>
        </div>
      )

      const Mounter = ({ second }) => <App second={second} />
      Mounter.contextTypes = {}

      const wrapper = mount(<Mounter second />)

      expect(First.rendered).toHaveBeenCalledTimes(1)
      expect(Second.rendered).toHaveBeenCalledTimes(1)

      incrementGeneration()
      wrapper.setProps({ update: 'now' })
      expect(First.rendered).toHaveBeenCalledTimes(3)
      expect(Second.rendered).toHaveBeenCalledTimes(3)

      incrementGeneration()
      wrapper.setProps({ second: false })
      expect(First.rendered).toHaveBeenCalledTimes(5)
      expect(Second.rendered).toHaveBeenCalledTimes(3)

      expect(First.unmounted).toHaveBeenCalledTimes(0)
      expect(Second.unmounted).toHaveBeenCalledTimes(1)
    })

    it('should handle child mounting', () => {
      const First = spyComponent(() => <u>test1</u>, 'test1', '1')
      const Second = spyComponent(() => <u>test2</u>, 'test2', '2')
      const Third = spyComponent(() => <u>test3</u>, 'test3', '3')
      const App = ({ first, second, third }) => (
        <div>
          {first && <First.Component />}
          {second && [
            <div key="1">start</div>,
            <Second.Component key="2" />,
            <div key="3">middle</div>,
            third && <Third.Component key="4" />,
          ]}
        </div>
      )

      App.contextTypes = {}

      const wrapper = mount(<App />)
      expect(First.rendered).toHaveBeenCalledTimes(0)

      incrementGeneration()
      wrapper.setProps({ first: true })
      expect(First.rendered).toHaveBeenCalledTimes(1) // 1. prev state was empty == no need to reconcile

      incrementGeneration()
      wrapper.setProps({ second: true })
      expect(First.rendered).toHaveBeenCalledTimes(3) // +3 (reconcile + update + render)
      expect(Second.rendered).toHaveBeenCalledTimes(1) // (update from first + render)

      wrapper.setProps({ third: true })
      expect(First.rendered).toHaveBeenCalledTimes(4)
      expect(Second.rendered).toHaveBeenCalledTimes(2)
      expect(Third.rendered).toHaveBeenCalledTimes(1)

      expect(wrapper.update().html()).toMatch(/test3/)
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

    describe('should assmeble props for nested children', () => {
      const testSuite = () => {
        const RenderChildren = ({ children }) => <div>{children}</div>
        const RenderProp = jest
          .fn()
          .mockImplementation(({ prop }) => <div>{prop}</div>)
        const DefaultProp = jest.fn().mockImplementation(({ prop }) => (
          <div>
            {prop ? (
              <div>42</div>
            ) : (
              <div>
                <div>24</div>
              </div>
            )}
          </div>
        ))
        DefaultProp.defaultProps = {
          prop: 'defaultValue',
        }

        const App = () => (
          <RenderChildren>
            <div>
              <RenderChildren>
                <div className="1">
                  <div className="1.1">
                    <div className="1.2">
                      <RenderProp value={42} />
                    </div>
                  </div>
                </div>
                <div className="2">
                  <div className="2.1">
                    <RenderProp value={24} />
                    <DefaultProp />
                  </div>
                </div>
              </RenderChildren>
            </div>
          </RenderChildren>
        )

        logger.warn.mockClear()

        const suite = () => (
          <AppContainer>
            <div>
              <App />
            </div>
          </AppContainer>
        )

        const wrapper = TestRenderer.create(suite())

        incrementGeneration()

        wrapper.update(suite())

        return { RenderProp, DefaultProp }
      }

      it('for Component SFC', () => {
        const { RenderProp, DefaultProp } = testSuite()
        const Comp = () => <div />
        expect(<Comp />.type.prototype.render).not.toBeDefined()

        expect(RenderProp).toHaveBeenCalledTimes(6)
        expect(RenderProp.mock.calls[0][0]).toEqual({ value: 42 })
        expect(RenderProp.mock.calls[1][0]).toEqual({ value: 24 })
        expect(RenderProp.mock.calls[2][0]).toEqual({ value: 42 })
        expect(RenderProp.mock.calls[3][0]).toEqual({ value: 24 })

        expect(DefaultProp).toHaveBeenCalledTimes(3)
        expect(DefaultProp.mock.calls[0][0]).toEqual({ prop: 'defaultValue' })
        expect(DefaultProp.mock.calls[1][0]).toEqual({ prop: 'defaultValue' })

        expect(logger.warn).not.toHaveBeenCalled()
      })

      // unstable between React15 / 16.6
      it.skip('for Pure SFC', () => {
        configuration.pureSFC = true
        const { RenderProp, DefaultProp } = testSuite()
        const Comp = () => <div />
        expect(<Comp />.type.prototype.render).not.toBeDefined()
        configuration.pureSFC = false

        expect(RenderProp).toHaveBeenCalledTimes(6)
        expect(RenderProp.mock.calls[0][0]).toEqual({ value: 42 })
        expect(RenderProp.mock.calls[1][0]).toEqual({ value: 24 })
        expect(RenderProp.mock.calls[2][0]).toEqual({ value: 42 })
        expect(RenderProp.mock.calls[3][0]).toEqual({ value: 24 })

        expect(DefaultProp).toHaveBeenCalledTimes(3)
        expect(DefaultProp.mock.calls[0][0]).toEqual({ prop: 'defaultValue' })
        expect(DefaultProp.mock.calls[1][0]).toEqual({ prop: 'defaultValue' })

        expect(logger.warn).not.toHaveBeenCalled()
      })

      it('for SFC disabled', () => {
        configuration.allowSFC = false
        const { RenderProp, DefaultProp } = testSuite()
        const Comp = () => <div />
        expect(<Comp />.type.prototype.render).toBeDefined()
        configuration.allowSFC = true

        expect(RenderProp).toHaveBeenCalledTimes(6)
        expect(RenderProp.mock.calls[0][0]).toEqual({ value: 42 })
        expect(RenderProp.mock.calls[1][0]).toEqual({ value: 24 })
        expect(RenderProp.mock.calls[2][0]).toEqual({ value: 42 })
        expect(RenderProp.mock.calls[3][0]).toEqual({ value: 24 })

        expect(DefaultProp).toHaveBeenCalledTimes(3)
        expect(DefaultProp.mock.calls[0][0]).toEqual({ prop: 'defaultValue' })
        expect(DefaultProp.mock.calls[1][0]).toEqual({ prop: 'defaultValue' })

        expect(logger.warn).not.toHaveBeenCalled()
      })
    })

    describe('when an error occurs in render', () => {
      beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterEach(() => {
        console.error.mockRestore()
      })

      it('should catch error', () => {
        const App = () => <div>Normal application</div>
        reactHotLoader.register(App, 'App', 'test.js')

        const TestCase = () => (
          <AppContainer>
            <App active />
          </AppContainer>
        )

        const wrapper = mount(<TestCase />)

        {
          const errorFn = active => {
            if (active) throw new Error()
            return null
          }
          const App = ({ active }) => (
            <div>
              Normal application
              <span>{errorFn(active)}</span>
            </div>
          )
          reactHotLoader.register(App, 'App', 'test.js')

          expect(() => wrapper.setProps({ children: <App /> })).toThrow()
          expect(reactHotLoader.disableProxyCreation).toBe(false)
        }

        expect(logger.warn).toHaveBeenCalledWith(
          `React-hot-loader: run time error during reconciliation`,
          expect.any(Error),
        )
      })

      it('should catch "suspense" error, but swallow it', () => {
        const App = () => <div>Normal application</div>
        reactHotLoader.register(App, 'App', 'test.js')

        const TestCase = () => (
          <AppContainer>
            <App active />
          </AppContainer>
        )

        const wrapper = mount(<TestCase />)

        {
          const errorFn = active => {
            if (active) throw Promise.resolve()
            return null
          }
          const App = ({ active }) => (
            <div>
              Normal application
              <span>{errorFn(active)}</span>
            </div>
          )
          reactHotLoader.register(App, 'App', 'test.js')

          expect(() => wrapper.setProps({ children: <App /> })).toThrow()
          expect(reactHotLoader.disableProxyCreation).toBe(false)
        }

        // not stable across es5/modern build modes. Tested manually
        // expect(logger.warn).not.toHaveBeenCalled();
      })
    })
  })
})
