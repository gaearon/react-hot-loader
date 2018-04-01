/* eslint-env browser */
import React, { Component } from 'react'
import createReactClass from 'create-react-class'
import { mount } from 'enzyme'
import { mapProps } from 'recompose'
import { AppContainer } from '../src/index.dev'
import RHL from '../src/reactHotLoader'
import { increment as incrementGeneration } from '../src/global/generation'

describe(`AppContainer (dev)`, () => {
  beforeEach(() => {
    RHL.reset()
  })

  describe('with class root', () => {
    it('renders children', () => {
      const spy = jest.fn()

      class App extends Component {
        render() {
          spy()
          return <div>hey</div>
        }
      }

      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      expect(wrapper.find('App').length).toBe(1)
      expect(wrapper.contains(<div>hey</div>)).toBe(true)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('force updates the tree on receiving new children', () => {
      const spy = jest.fn()

      class App extends Component {
        shouldComponentUpdate() {
          return false
        }

        render() {
          spy()
          return <div>hey</div>
        }
      }

      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      expect(spy).toHaveBeenCalledTimes(1)

      {
        class App extends Component {
          shouldComponentUpdate() {
            return false
          }

          render() {
            spy()
            return <div>ho</div>
          }
        }

        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: <App /> })
      }

      expect(spy).toHaveBeenCalledTimes(3)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('force updates the tree on receiving cached children', () => {
      const spy = jest.fn()

      class App extends Component {
        shouldComponentUpdate() {
          return false
        }

        render() {
          spy()
          return <div>hey</div>
        }
      }

      RHL.register(App, 'App', 'test.js')

      const element = <App />
      const wrapper = mount(<AppContainer>{element}</AppContainer>)
      expect(spy).toHaveBeenCalledTimes(1)

      {
        class App extends Component {
          shouldComponentUpdate() {
            return false
          }

          render() {
            spy()
            return <div>ho</div>
          }
        }

        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: element })
      }

      expect(spy).toHaveBeenCalledTimes(3)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('renders latest children on receiving cached never-rendered children', () => {
      const spy = jest.fn()

      class App extends Component {
        shouldComponentUpdate() {
          return false
        }

        render() {
          spy()
          return <div>hey</div>
        }
      }

      RHL.register(App, 'App', 'test.js')

      const element = <App />
      let wrapper

      {
        class App extends Component {
          shouldComponentUpdate() {
            return false
          }

          render() {
            spy()
            return <div>ho</div>
          }
        }

        RHL.register(App, 'App', 'test.js')
        wrapper = mount(<AppContainer>{element}</AppContainer>)
      }

      expect(spy).toHaveBeenCalledTimes(1)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('hot-reloads children without losing state', () => {
      class App extends Component {
        constructor(props) {
          super(props)
          this.state = { value: 'old' }
        }

        shouldComponentUpdate() {
          return false
        }

        render() {
          return <div>old render + {this.state.value} state</div>
        }
      }

      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      expect(wrapper.text()).toBe('old render + old state')

      {
        class App extends Component {
          constructor(props) {
            super(props)
            this.state = { value: 'new' }
          }

          shouldComponentUpdate() {
            return false
          }

          render() {
            return <div>new render + {this.state.value} state</div>
          }
        }

        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: <App /> })
      }

      expect(wrapper.text()).toBe('new render + old state')
    })

    it('replaces children class methods', () => {
      const spy = jest.fn()

      class App extends Component {
        constructor(props) {
          super(props)
          this.state = { value: 'old' }
        }

        shouldComponentUpdate() {
          return false
        }

        handleClick() {
          spy('foo')
        }

        render() {
          return (
            <span onClick={this.handleClick}>
              old render + {this.state.value} state
            </span>
          )
        }
      }

      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      wrapper.find('span').simulate('click')
      expect(spy).toHaveBeenCalledWith('foo')
      expect(wrapper.text()).toBe('old render + old state')

      spy.mockReset()
      {
        class App extends Component {
          constructor(props) {
            super(props)
            this.state = { value: 'new' }
          }

          shouldComponentUpdate() {
            return false
          }

          handleClick() {
            spy('bar')
          }

          render() {
            return (
              <span onClick={this.handleClick}>
                new render + {this.state.value} state
              </span>
            )
          }
        }

        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: <App /> })
      }

      wrapper.find('span').simulate('click')
      expect(spy).toHaveBeenCalledWith('bar')
      expect(wrapper.text()).toBe('new render + old state')
    })

    it('replaces children class property arrow functions', () => {
      const spy = jest.fn()

      class App extends Component {
        constructor(props) {
          super(props)
          this.state = { value: 'old' }
        }

        shouldComponentUpdate() {
          return false
        }

        handleClick = () => {
          spy('foo')
        }

        render() {
          return (
            <span onClick={this.handleClick}>
              old render + {this.state.value} state
            </span>
          )
        }
      }

      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      wrapper.find('span').simulate('click')
      expect(spy).toHaveBeenCalledWith('foo')
      expect(wrapper.text()).toBe('old render + old state')

      spy.mockReset()
      window.spy = spy

      {
        class App extends Component {
          constructor(props) {
            super(props)
            this.state = { value: 'new' }
          }

          shouldComponentUpdate() {
            return false
          }

          handleClick = () => {
            window.spy('bar')
          }

          /* eslint-disable */
          __reactstandin__regenerateByEval(key, code) {
            this[key] = eval(code)
          }

          /* eslint-enable */

          render() {
            return (
              <span onClick={this.handleClick}>
                new render + {this.state.value} state
              </span>
            )
          }
        }

        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: <App /> })
      }

      wrapper.find('span').simulate('click')
      expect(spy).toHaveBeenCalledWith('bar')
      expect(wrapper.text()).toBe('new render + old state')
    })

    it('replaces children class arrow functions in constructor', () => {
      const spy = jest.fn()

      class App extends Component {
        constructor(props) {
          super(props)

          this.handleClick = () => {
            spy('foo')
          }

          this.state = { value: 'old' }
        }

        shouldComponentUpdate() {
          return false
        }

        render() {
          return (
            <span onClick={this.handleClick}>
              old render + {this.state.value} state
            </span>
          )
        }
      }

      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      wrapper.find('span').simulate('click')
      expect(spy).toHaveBeenCalledWith('foo')
      expect(wrapper.text()).toBe('old render + old state')

      spy.mockReset()
      window.spy = spy

      {
        class App extends Component {
          constructor(props) {
            super(props)
            this.state = { value: 'new' }
          }

          shouldComponentUpdate() {
            return false
          }

          handleClick = () => {
            window.spy('bar')
          }

          /* eslint-disable */
          __reactstandin__regenerateByEval(key, code) {
            this[key] = eval(code)
          }

          /* eslint-enable */

          render() {
            return (
              <span onClick={this.handleClick}>
                new render + {this.state.value} state
              </span>
            )
          }
        }

        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: <App /> })
      }

      wrapper.find('span').simulate('click')
      expect(spy).toHaveBeenCalledWith('bar')
      expect(wrapper.text()).toBe('new render + old state')
    })

    it('replaces children class property arrow functions without block statement bodies', () => {
      const spy = jest.fn()

      class App extends Component {
        constructor(props) {
          super(props)
          this.state = { value: 'old' }
        }

        shouldComponentUpdate() {
          return false
        }

        handleClick = () => spy('foo')

        render() {
          return (
            <span onClick={this.handleClick}>
              old render + {this.state.value} state
            </span>
          )
        }
      }

      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      wrapper.find('span').simulate('click')
      expect(spy).toHaveBeenCalledWith('foo')
      expect(wrapper.text()).toBe('old render + old state')

      spy.mockReset()

      window.spy = spy

      {
        class App extends Component {
          constructor(props) {
            super(props)
            this.state = { value: 'new' }
          }

          shouldComponentUpdate() {
            return false
          }

          handleClick = () => window.spy('bar')

          /* eslint-disable */
          __reactstandin__regenerateByEval(key, code) {
            this[key] = eval(code)
          }

          /* eslint-enable */

          render() {
            return (
              <span onClick={this.handleClick}>
                new render + {this.state.value} state
              </span>
            )
          }
        }

        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: <App /> })
      }

      wrapper.find('span').simulate('click')
      expect(spy).toHaveBeenCalledWith('bar')
      expect(wrapper.text()).toBe('new render + old state')
    })

    it(
      'replaces children with class property arrow ' +
        'functions with different numbers of arguments',
      () => {
        const spy = jest.fn()

        class App extends Component {
          constructor(props) {
            super(props)
            this.state = { value: 'old' }
          }

          shouldComponentUpdate() {
            return false
          }

          handleClick = () => spy('foo')

          render() {
            return (
              <span onClick={this.handleClick}>
                old render + {this.state.value} state
              </span>
            )
          }
        }

        RHL.register(App, 'App', 'test.js')

        const wrapper = mount(
          <AppContainer>
            <App />
          </AppContainer>,
        )
        wrapper.find('span').simulate('click')
        expect(spy).toHaveBeenCalledWith('foo')
        expect(wrapper.text()).toBe('old render + old state')

        spy.mockReset()
        window.spy = spy
        {
          class App extends Component {
            constructor(props) {
              super(props)
              this.state = { value: 'new' }
            }

            shouldComponentUpdate() {
              return false
            }

            handleClick = ({ target }) => window.spy(target.value)

            /* eslint-disable */
            __reactstandin__regenerateByEval(key, code) {
              this[key] = eval(code)
            }

            /* eslint-enable */

            render() {
              return (
                <span onClick={this.handleClick}>
                  new render + {this.state.value} state
                </span>
              )
            }
          }

          RHL.register(App, 'App', 'test.js')
          wrapper.setProps({ children: <App /> })
        }

        wrapper.find('span').simulate('click', { target: { value: 'bar' } })
        expect(spy).toHaveBeenCalledWith('bar')
        expect(wrapper.text()).toBe('new render + old state')
      },
    )
  })

  describe('with createClass root', () => {
    it('renders children', () => {
      const spy = jest.fn()
      const App = createReactClass({
        render() {
          spy()
          return <div>hey</div>
        },
      })
      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      expect(wrapper.find('App').length).toBe(1)
      expect(wrapper.contains(<div>hey</div>)).toBe(true)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('force updates the tree on receiving new children', () => {
      const spy = jest.fn()

      const App = createReactClass({
        shouldComponentUpdate() {
          return false
        },

        render() {
          spy()
          return <div>hey</div>
        },
      })
      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      expect(spy).toHaveBeenCalledTimes(1)

      {
        const App = createReactClass({
          shouldComponentUpdate() {
            return false
          },

          render() {
            spy()
            return <div>ho</div>
          },
        })
        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: <App /> })
      }

      expect(spy).toHaveBeenCalledTimes(1 + 2)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('force updates the tree on receiving cached children', () => {
      const spy = jest.fn()

      const App = createReactClass({
        shouldComponentUpdate() {
          return false
        },

        render() {
          spy()
          return <div>hey</div>
        },
      })
      RHL.register(App, 'App', 'test.js')

      const element = <App />
      const wrapper = mount(<AppContainer>{element}</AppContainer>)
      expect(spy).toHaveBeenCalledTimes(1)

      {
        const App = createReactClass({
          shouldComponentUpdate() {
            return false
          },

          render() {
            spy()
            return <div>ho</div>
          },
        })
        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: element })
      }

      expect(spy).toHaveBeenCalledTimes(1 + 2)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('renders latest children on receiving cached never-rendered children', () => {
      const spy = jest.fn()

      const App = createReactClass({
        shouldComponentUpdate() {
          return false
        },

        render() {
          spy()
          return <div>hey</div>
        },
      })
      RHL.register(App, 'App', 'test.js')

      const element = <App />
      let wrapper

      {
        const App = createReactClass({
          shouldComponentUpdate() {
            return false
          },

          render() {
            spy()
            return <div>ho</div>
          },
        })
        RHL.register(App, 'App', 'test.js')
        wrapper = mount(<AppContainer>{element}</AppContainer>)
      }

      expect(spy).toHaveBeenCalledTimes(1)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('hot-reloads children without losing state', () => {
      const App = createReactClass({
        getInitialState() {
          return { value: 'old' }
        },

        shouldComponentUpdate() {
          return false
        },

        render() {
          return <div>old render + {this.state.value} state</div>
        },
      })
      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      expect(wrapper.text()).toBe('old render + old state')

      {
        const App = createReactClass({
          getInitialState() {
            return { value: 'new' }
          },

          shouldComponentUpdate() {
            return false
          },

          render() {
            return <div>new render + {this.state.value} state</div>
          },
        })
        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: <App /> })
      }

      expect(wrapper.text()).toBe('new render + old state')
    })
  })

  describe('with createFactory root', () => {
    it('renders children', () => {
      const spy = jest.fn()
      const App = createReactClass({
        render() {
          spy()
          return <div>hey</div>
        },
      })
      RHL.register(App, 'App', 'test.js')
      const AppF = React.createFactory(App)

      const wrapper = mount(<AppContainer>{AppF()}</AppContainer>)
      expect(wrapper.find('App').length).toBe(1)
      expect(wrapper.contains(<div>hey</div>)).toBe(true)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('force updates the tree on receiving new children', () => {
      const spy = jest.fn()

      const App = createReactClass({
        shouldComponentUpdate() {
          return false
        },

        render() {
          spy()
          return <div>hey</div>
        },
      })
      RHL.register(App, 'App', 'test.js')
      const AppF = React.createFactory(App)

      const wrapper = mount(<AppContainer>{AppF()}</AppContainer>)
      expect(spy).toHaveBeenCalledTimes(1)

      {
        const App = createReactClass({
          shouldComponentUpdate() {
            return false
          },

          render() {
            spy()
            return <div>ho</div>
          },
        })
        RHL.register(App, 'App', 'test.js')
        const AppF = React.createFactory(App)
        wrapper.setProps({ children: AppF() })
      }

      expect(spy).toHaveBeenCalledTimes(1 + 2)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('force updates the tree on receiving cached children', () => {
      const spy = jest.fn()

      const App = createReactClass({
        shouldComponentUpdate() {
          return false
        },

        render() {
          spy()
          return <div>hey</div>
        },
      })
      RHL.register(App, 'App', 'test.js')
      const AppF = React.createFactory(App)

      const element = AppF()
      const wrapper = mount(<AppContainer>{element}</AppContainer>)
      expect(spy).toHaveBeenCalledTimes(1)

      {
        const App = createReactClass({
          shouldComponentUpdate() {
            return false
          },

          render() {
            spy()
            return <div>ho</div>
          },
        })
        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: element })
      }

      expect(spy).toHaveBeenCalledTimes(1 + 2)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('renders latest children on receiving cached never-rendered children', () => {
      const spy = jest.fn()

      const App = createReactClass({
        shouldComponentUpdate() {
          return false
        },

        render() {
          spy()
          return <div>hey</div>
        },
      })
      RHL.register(App, 'App', 'test.js')
      const AppF = React.createFactory(App)

      const element = AppF()
      let wrapper

      {
        const App = createReactClass({
          shouldComponentUpdate() {
            return false
          },

          render() {
            spy()
            return <div>ho</div>
          },
        })
        RHL.register(App, 'App', 'test.js')
        wrapper = mount(<AppContainer>{element}</AppContainer>)
      }

      expect(spy).toHaveBeenCalledTimes(1)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('hot-reloads children without losing state', () => {
      const App = createReactClass({
        getInitialState() {
          return { value: 'old' }
        },

        shouldComponentUpdate() {
          return false
        },

        render() {
          return <div>old render + {this.state.value} state</div>
        },
      })
      RHL.register(App, 'App', 'test.js')
      const AppF = React.createFactory(App)

      const wrapper = mount(<AppContainer>{AppF()}</AppContainer>)
      expect(wrapper.text()).toBe('old render + old state')

      {
        const App = createReactClass({
          getInitialState() {
            return { value: 'new' }
          },

          shouldComponentUpdate() {
            return false
          },

          render() {
            return <div>new render + {this.state.value} state</div>
          },
        })
        RHL.register(App, 'App', 'test.js')
        const AppF = React.createFactory(App)
        wrapper.setProps({ children: AppF() })
      }

      expect(wrapper.text()).toBe('new render + old state')
    })
  })

  describe('with SFC root', () => {
    it('renders children', () => {
      const spy = jest.fn()
      const App = () => {
        spy()
        return <div>hey</div>
      }
      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      expect(wrapper.find('App').length).toBe(1)
      expect(wrapper.contains(<div>hey</div>)).toBe(true)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('renders falsy children', () => {
      const spy = jest.fn()
      const App = () => {
        spy()
        return null
      }
      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      expect(wrapper.find('App').length).toBe(1)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('force updates the tree on receiving new children', () => {
      const spy = jest.fn()

      const App = () => {
        spy()
        return <div>hey</div>
      }
      RHL.register(App, 'App', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      expect(spy).toHaveBeenCalledTimes(1)

      {
        const App = () => {
          spy()
          return <div>ho</div>
        }
        RHL.register(App, 'App', 'test.js')
        wrapper.setProps({ children: <App /> })
      }

      expect(spy).toHaveBeenCalledTimes(1 + 2)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('force updates the tree on receiving cached children', () => {
      const firstSpy = jest.fn()
      const Dummy = () => {
        firstSpy()
        return <div>first</div>
      }

      const App = () => <Dummy />
      RHL.register(Dummy, 'Dummy', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <App />
        </AppContainer>,
      )
      expect(firstSpy).toHaveBeenCalledTimes(1)

      const secondSpy = jest.fn()

      {
        const Dummy = () => {
          secondSpy()
          return <div>second</div>
        }
        RHL.register(Dummy, 'Dummy', 'test.js')
        wrapper.setProps({ children: <App /> })
      }

      expect(firstSpy).toHaveBeenCalledTimes(1)
      expect(secondSpy).toHaveBeenCalledTimes(2)
      expect(wrapper.contains(<div>second</div>)).toBe(true)
    })

    it('renders latest children on receiving cached never-rendered children', () => {
      const spy = jest.fn()

      const App = () => {
        spy()
        return <div>hey</div>
      }
      RHL.register(App, 'App', 'test.js')

      const element = <App />
      let wrapper

      {
        const App = () => {
          spy()
          return <div>ho</div>
        }
        RHL.register(App, 'App', 'test.js')
        wrapper = mount(<AppContainer>{element}</AppContainer>)
      }

      expect(spy).toHaveBeenCalledTimes(1)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('hot-reloads children without losing state', () => {
      class App extends Component {
        constructor(props) {
          super(props)
          this.state = { value: 'old' }
        }

        shouldComponentUpdate() {
          return false
        }

        render() {
          return <div>old render + {this.state.value} state</div>
        }
      }

      RHL.register(App, 'App', 'test.js')

      const Root = () => <App />
      RHL.register(Root, 'Root', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <Root />
        </AppContainer>,
      )
      expect(wrapper.text()).toBe('old render + old state')

      {
        class App extends Component {
          constructor(props) {
            super(props)
            this.state = { value: 'new' }
          }

          shouldComponentUpdate() {
            return false
          }

          render() {
            return <div>new render + {this.state.value} state</div>
          }
        }

        RHL.register(App, 'App', 'test.js')

        const Root = () => <App />
        RHL.register(Root, 'Root', 'test.js')
        wrapper.setProps({ children: <Root /> })
      }

      expect(wrapper.text()).toBe('new render + old state')
    })
  })

  it('hot-reloads nested children without losing state', () => {
    const onUnmount = jest.fn()
    let child = 1

    function getChild() {
      if (child === 1) {
        return class Child extends Component {
          componentWillUnmount() {
            onUnmount()
          }

          render() {
            return <div>old child</div>
          }
        }
      }
      return class Child extends Component {
        componentWillUnmount() {
          // onUnmount();
        }

        render() {
          return <div>new child</div>
        }
      }
    }

    class Layout extends Component {
      render() {
        return (
          <div>
            <h1>TEST</h1>
            {this.props.children}
          </div>
        )
      }
    }

    class App extends Component {
      render() {
        const Child = getChild()
        return (
          <Layout>
            <Child />
            <Child />
          </Layout>
        )
      }
    }

    const Root = () => <App />
    RHL.register(Root, 'Root', 'test.js')
    RHL.register(App, 'App', 'test.js')

    const wrapper = mount(
      <AppContainer>
        <Root />
      </AppContainer>,
    )

    expect(onUnmount).toHaveBeenCalledTimes(0)

    child = 2
    // emulate HRM
    incrementGeneration()
    wrapper.setProps({ children: <Root /> })
    expect(onUnmount).toHaveBeenCalledTimes(0)

    expect(wrapper.text()).toBe('TESTnew childnew child')
  })

  it('renders children with chunked re-register', () => {
    const spy = jest.fn()

    class App extends Component {
      componentWillUnmount() {
        spy()
      }

      render() {
        return <div>I AM CHILD</div>
      }
    }

    RHL.reset()
    RHL.register(App, 'App1', 'test.js')
    RHL.register(App, 'App2', 'test.js')

    const wrapper = mount(
      <AppContainer>
        <App />
      </AppContainer>,
    )
    expect(spy).not.toHaveBeenCalled()
    wrapper.setProps({ children: <App /> })
    expect(spy).not.toHaveBeenCalled()
    RHL.register(App, 'App3', 'test.js')
    wrapper.setProps({ children: <App /> })
    expect(spy).not.toHaveBeenCalled()

    {
      class App extends Component {
        componentWillUnmount() {
          spy()
        }

        render() {
          return <div>I AM NEW CHILD</div>
        }
      }
      RHL.register(App, 'App3', 'test.js')
      wrapper.setProps({ children: <App /> })
      expect(spy).not.toHaveBeenCalled()

      RHL.register(App, 'App4', 'test.js')
      wrapper.setProps({ children: <App /> })
      expect(spy).not.toHaveBeenCalled()
    }
  })

  describe('with HOC-wrapped root', () => {
    it('renders children', () => {
      const spy = jest.fn()

      class App extends React.Component {
        render() {
          spy()
          return <div>hey</div>
        }
      }

      RHL.register(App, 'App', 'test.js')

      const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
      RHL.register(Enhanced, 'Enhanced', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <Enhanced n={3} />
        </AppContainer>,
      )
      expect(wrapper.find('App').length).toBe(1)
      expect(wrapper.contains(<div>hey</div>)).toBe(true)
      expect(wrapper.find('App').prop('n')).toBe(15)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('force updates the tree on receiving new children', () => {
      const spy = jest.fn()

      class App extends React.Component {
        render() {
          spy()
          return <div>hey</div>
        }
      }

      RHL.register(App, 'App', 'test.js')

      const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
      RHL.register(Enhanced, 'Enhanced', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <Enhanced n={3} />
        </AppContainer>,
      )
      expect(spy).toHaveBeenCalledTimes(1)

      {
        class App extends React.Component {
          render() {
            spy()
            return <div>ho</div>
          }
        }

        RHL.register(App, 'App', 'test.js')

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
        RHL.register(Enhanced, 'Enhanced', 'test.js')
        wrapper.setProps({ children: <Enhanced n={3} /> })
      }

      expect(spy).toHaveBeenCalledTimes(1 + 2)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('force updates the tree on receiving cached children', () => {
      const firstSpy = jest.fn()
      const Dummy = () => {
        firstSpy()
        return <div>first</div>
      }
      const App = () => <Dummy />
      RHL.register(Dummy, 'Dummy', 'test.js')

      const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
      RHL.register(Enhanced, 'Enhanced', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <Enhanced n={3} />
        </AppContainer>,
      )
      expect(firstSpy).toHaveBeenCalledTimes(1)

      const secondSpy = jest.fn()
      {
        const Dummy = () => {
          secondSpy()
          return <div>second</div>
        }
        RHL.register(Dummy, 'Dummy', 'test.js')

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
        RHL.register(Enhanced, 'Enhanced', 'test.js')
        wrapper.setProps({ children: <Enhanced n={3} /> })
      }

      expect(firstSpy).toHaveBeenCalledTimes(1)
      expect(secondSpy).toHaveBeenCalledTimes(2)
      expect(wrapper.contains(<div>second</div>)).toBe(true)
    })

    it('support indeterminateComponent', () => {
      const spy = jest.fn()

      const AnotherComponent = () => <div>old</div>

      class App extends React.Component {
        render() {
          return (
            <div>
              hey {this.props.n} <AnotherComponent />
            </div>
          )
        }
      }

      let CurrentApp = App

      RHL.register(AnotherComponent, 'AnotherComponent', 'test.js')
      RHL.register(App, 'App', 'test.js')

      // return rendered component from a stateless
      const IndeterminateComponent = (props, context) =>
        new CurrentApp(props, context)
      // return <CurrentApp {...props} />

      const RootApp = props => <IndeterminateComponent {...props} />

      const wrapper = mount(
        <AppContainer>
          <RootApp n={42} />
        </AppContainer>,
      )
      expect(wrapper.text()).toBe('hey 42 old')
      {
        class App2 extends React.Component {
          render() {
            spy()
            return <div>ho {this.props.n + 1}</div>
          }
        }

        RHL.register(App2, 'App', 'test.js')
        CurrentApp = App2

        const AnotherComponent = () => <div>new</div>
        RHL.register(AnotherComponent, 'AnotherComponent', 'test.js')

        wrapper.setProps({ update: true, children: <RootApp n={44} /> })

        // How it works. IndeterminateComponent calculates return value once.
        expect(wrapper.text()).toBe('hey 44 new')
        expect(spy).toHaveBeenCalledTimes(0) // never gets called

        // How it should work
        // expect(wrapper.text()).toBe('ho 45 new');
        // expect(spy).toHaveBeenCalledTimes(2);
      }
    })

    it('renders latest children on receiving cached never-rendered children', () => {
      const spy = jest.fn()

      class App extends React.Component {
        render() {
          spy()
          return <div>hey</div>
        }
      }

      RHL.register(App, 'App', 'test.js')

      const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
      RHL.register(Enhanced, 'Enhanced', 'test.js')

      const element = <Enhanced n={3} />
      let wrapper

      {
        class App extends React.Component {
          render() {
            spy()
            return <div>ho</div>
          }
        }

        RHL.register(App, 'App', 'test.js')

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
        RHL.register(Enhanced, 'Enhanced', 'test.js')
        wrapper = mount(<AppContainer>{element}</AppContainer>)
      }

      expect(spy).toHaveBeenCalledTimes(1)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })

    it('hot-reloads children with overriden render', () => {
      class App extends Component {
        constructor() {
          super()
          this.secret = 1
          this.superSecret = 42
        }

        componentWillMount() {
          const oldRender = this.render.bind(this)
          this.render = () => {
            this.superSecret = this.secret + 1
            return <div>PATCHED + {oldRender()}</div>
          }
        }

        render() {
          return <div>{this.superSecret}</div>
        }
      }

      RHL.register(App, 'App', 'test.js')

      const MiddleApp = () => (
        <div>
          <App />
        </div>
      )

      const wrapper = mount(
        <AppContainer>
          <MiddleApp />
        </AppContainer>,
      )
      expect(wrapper.text()).toBe('PATCHED + 2')

      {
        class App2 extends Component {
          constructor() {
            super()
            this.secret = 2
          }

          render() {
            return <div>{this.superSecret * 2} v2</div>
          }
        }

        RHL.register(App2, 'App', 'test.js')

        wrapper.setProps({ children: <MiddleApp /> })
      }

      expect(wrapper.update().text()).toBe('PATCHED + 6 v2')
    })

    it('hot-reloads children inside Fragments', () => {
      if (React.version.startsWith('16')) {
        const unmount = jest.fn()

        class InnerComponent extends Component {
          componentWillUnmount() {
            unmount()
          }

          render() {
            return <div>OldInnerComponent</div>
          }
        }

        InnerComponent.displayName = 'InnerComponent'

        const InnerItem = () => (
          <React.Fragment>
            -1-<InnerComponent />
          </React.Fragment>
        )
        RHL.register(InnerItem, 'InnerItem', 'test.js')

        const Item = () => (
          <React.Fragment>
            <li>1</li>
            <li>
              <InnerItem />
            </li>
            <li>3</li>
          </React.Fragment>
        )
        //
        const App = () => (
          <ul>
            <Item />
          </ul>
        )

        const wrapper = mount(
          <AppContainer>
            <App />
          </AppContainer>,
        )

        expect(wrapper.update().text()).toBe('1-1-OldInnerComponent3')
        {
          class InnerComponent extends Component {
            componentWillUnmount() {
              unmount()
            }

            render() {
              return <div>NewInnerComponent</div>
            }
          }

          InnerComponent.displayName = 'InnerComponent'

          const InnerItem = () => (
            <React.Fragment>
              -2-<InnerComponent />
            </React.Fragment>
          )
          RHL.register(InnerItem, 'InnerItem', 'test.js')

          wrapper.setProps({ children: <App /> })
        }
        expect(unmount).toHaveBeenCalledTimes(0)
        expect(wrapper.update().text()).toBe('1-2-NewInnerComponent3')
      } else {
        // React 15 is always ok
        expect(true).toBe(true)
      }
    })

    it('hot-reloads children without losing state', () => {
      class App extends Component {
        constructor(props) {
          super(props)
          this.state = { value: 'old' }
        }

        shouldComponentUpdate() {
          return false
        }

        render() {
          return (
            <div>
              old render + {this.state.value} state + {this.props.n}
            </div>
          )
        }
      }

      RHL.register(App, 'App', 'test.js')

      const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
      RHL.register(Enhanced, 'Enhanced', 'test.js')

      const wrapper = mount(
        <AppContainer>
          <Enhanced n={3} />
        </AppContainer>,
      )
      expect(wrapper.text()).toBe('old render + old state + 15')

      {
        class App extends Component {
          constructor(props) {
            super(props)
            this.state = { value: 'new' }
          }

          shouldComponentUpdate() {
            return false
          }

          render() {
            return (
              <div>
                new render + {this.state.value} state + {this.props.n}
              </div>
            )
          }
        }

        RHL.register(App, 'App', 'test.js')

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
        RHL.register(Enhanced, 'Enhanced', 'test.js')
        wrapper.setProps({ children: <Enhanced n={4} /> })
      }

      expect(wrapper.text()).toBe('new render + old state + 20')
    })
  })
})
