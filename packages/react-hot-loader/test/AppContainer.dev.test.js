/* eslint-env jest */

import React, { Component } from 'react'
import createReactClass from 'create-react-class'
import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme'
import { mapProps } from 'recompose'
import '../src/patch.dev'
import AppContainer from '../src/AppContainer.dev'

configure({ adapter: new Adapter() });

const RHL = global.__REACT_HOT_LOADER__

function runAllTests(useWeakMap) {
  describe(`<AppContainer /> [useWeakMap == ${useWeakMap}]`, () => {
    beforeEach(() => {
      RHL.reset(useWeakMap)
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

        expect(spy).toHaveBeenCalledTimes(2)
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

        expect(spy).toHaveBeenCalledTimes(2)
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
        {
          class App extends Component {
            constructor(props) {
              super(props)
              this.state = { value: 'new' }
            }

            shouldComponentUpdate() {
              return false
            }

            handleClick = () => spy('bar')

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
          {
            class App extends Component {
              constructor(props) {
                super(props)
                this.state = { value: 'new' }
              }

              shouldComponentUpdate() {
                return false
              }

              handleClick = ({ target }) => spy(target.value)

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

        expect(spy).toHaveBeenCalledTimes(2)
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

        expect(spy).toHaveBeenCalledTimes(2)
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

        expect(spy).toHaveBeenCalledTimes(2)
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

        expect(spy).toHaveBeenCalledTimes(2)
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

        expect(spy).toHaveBeenCalledTimes(2)
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
        expect(secondSpy).toHaveBeenCalledTimes(1)
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

        expect(spy).toHaveBeenCalledTimes(2)
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
        expect(secondSpy).toHaveBeenCalledTimes(1)
        expect(wrapper.contains(<div>second</div>)).toBe(true)
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

    describe('container props', () => {
      it('can disable warnings', () => {
        mount(
          <AppContainer>
            <div>hey</div>
          </AppContainer>,
        )

        expect(RHL.warnings).toBe(true)

        mount(
          <AppContainer warnings={false}>
            <div>hey</div>
          </AppContainer>,
        )

        expect(RHL.warnings).toBe(false)
        delete RHL.warnings
      })
    })
  })
}

runAllTests(true)
// runAllTests(false)
