import './setup'
import React, {Component} from 'react'
import expect, {createSpy} from 'expect'
import {mount} from 'enzyme'

import AppContainer from '../../src/AppContainer.dev'

const tag = (comp, name) => comp.__source = { fileName: name, localName: name }

describe('<AppContainer />', () => {
  describe('when passed children', () => {
    describe('with class root', () => {
      it('renders it', () => {
        const spy = createSpy()
        class App extends Component {
          render() {
            spy()
            return <div>hey</div>
          }
        }
        tag(App, 'App')

        const wrapper = mount(<AppContainer><App /></AppContainer>)
        expect(wrapper.find('App').length).toBe(1)
        expect(wrapper.contains(<div>hey</div>)).toBe(true)
        expect(spy.calls.length).toBe(1)
      })

      it('force updates the tree on receiving new children', () => {
        const spy = createSpy()

        class App extends Component {
          shouldComponentUpdate() {
            return false
          }

          render() {
            spy()
            return <div>hey</div>
          }
        }
        tag(App, 'App')

        const wrapper = mount(<AppContainer><App /></AppContainer>)
        expect(spy.calls.length).toBe(1)

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
          tag(App, 'App')
          wrapper.setProps({children: <App />})
        }

        expect(spy.calls.length).toBe(2)
        expect(wrapper.contains(<div>ho</div>)).toBe(true)
      })

      it('hot-reloads without losing state', () => {
        class App extends Component {
          componentWillMount() {
            this.state = 'old'
          }

          shouldComponentUpdate() {
            return false
          }

          render() {
            return <div>old render + {this.state} state</div>
          }
        }
        tag(App, 'App')

        const wrapper = mount(<AppContainer><App /></AppContainer>)
        expect(wrapper.text()).toBe('old render + old state')

        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new'
            }

            shouldComponentUpdate() {
              return false
            }

            render() {
              return <div>new render + {this.state} state</div>
            }
          }
          tag(App, 'App')
          wrapper.setProps({children: <App />})
        }

        expect(wrapper.text()).toBe('new render + old state')
      })
    })

    describe('with SFC root', () => {
      it('renders it', () => {
        const spy = createSpy()
        const App = () => {
          spy()
          return <div>hey</div>
        }
        tag(App, 'App')

        const wrapper = mount(<AppContainer><App /></AppContainer>)
        expect(wrapper.find('App').length).toBe(1)
        expect(wrapper.contains(<div>hey</div>)).toBe(true)
        expect(spy.calls.length).toBe(1)
      })

      it('force updates the tree on receiving new children', () => {
        const spy = createSpy()

        const App = () => {
          spy()
          return <div>hey</div>
        }
        tag(App, 'App')

        const wrapper = mount(<AppContainer><App /></AppContainer>)
        expect(spy.calls.length).toBe(1)

        {
          const App = () => {
            spy()
            return <div>ho</div>
          }
          tag(App, 'App')
          wrapper.setProps({children: <App />})
        }

        expect(spy.calls.length).toBe(2)
        expect(wrapper.contains(<div>ho</div>)).toBe(true)
      })

      it('hot-reloads without losing state', () => {
        class App extends Component {
          componentWillMount() {
            this.state = 'old'
          }

          shouldComponentUpdate() { return false }

          render() {
            return <div>old render + {this.state} state</div>
          }
        }
        tag(App, 'App')

        const Root = () => <App />
        tag(Root, 'Root')

        const wrapper = mount(<AppContainer><Root /></AppContainer>)
        expect(wrapper.text()).toBe('old render + old state')

        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new'
            }

            shouldComponentUpdate() { return false }

            render() {
              return <div>new render + {this.state} state</div>
            }
          }
          tag(App, 'App')

          const Root = () => <App />
          tag(Root, 'Root')
          wrapper.setProps({children: <Root />})
        }

        expect(wrapper.text()).toBe('new render + old state')
      })
    })

    describe('with HOC-wrapped root', () => {
      const mapProps = require('recompose').mapProps
      it('renders it', () => {
        const spy = createSpy()
        class App extends React.Component {
          render() {
            spy()
            return <div>hey</div>
          }
        }
        tag(App, 'App')

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
        tag(Enhanced, 'Enhanced')

        const wrapper = mount(<AppContainer><Enhanced n={3} /></AppContainer>)
        expect(wrapper.find('App').length).toBe(1)
        expect(wrapper.contains(<div>hey</div>)).toBe(true)
        expect(wrapper.find('App').prop('n')).toBe(15)
        expect(spy.calls.length).toBe(1)
      })

      it('force updates the tree on receiving new children', () => {
        const spy = createSpy()
        class App extends React.Component {
          render() {
            spy()
            return <div>hey</div>
          }
        }
        tag(App, 'App')

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
        tag(Enhanced, 'Enhanced')

        const wrapper = mount(<AppContainer><Enhanced n={3} /></AppContainer>)
        expect(spy.calls.length).toBe(1)

        {
          class App extends React.Component {
            render() {
              spy()
              return <div>ho</div>
            }
          }
          tag(App, 'App')

          const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
          tag(Enhanced, 'Enhanced')
          wrapper.setProps({children: <Enhanced n={3} />})
        }

        expect(spy.calls.length).toBe(2)
        expect(wrapper.contains(<div>ho</div>)).toBe(true)
      })

      it('hot-reloads without losing state', () => {
        class App extends Component {
          componentWillMount() {
            this.state = 'old'
          }

          shouldComponentUpdate() { return false }

          render() {
            return <div>old render + {this.state} state + {this.props.n}</div>
          }
        }
        tag(App, 'App')

        const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
        tag(Enhanced, 'Enhanced')

        const wrapper = mount(<AppContainer><Enhanced n={3} /></AppContainer>)
        expect(wrapper.text()).toBe('old render + old state + 15')

        {
          class App extends Component {
            componentWillMount() {
              this.state = 'new'
            }

            shouldComponentUpdate() { return false }

            render() {
              return <div>new render + {this.state} state + {this.props.n}</div>
            }
          }
          tag(App, 'App')

          const Enhanced = mapProps(props => ({ n: props.n * 5 }))(App)
          tag(Enhanced, 'Enhanced')
          wrapper.setProps({children: <Enhanced n={4} />})
        }

        expect(wrapper.text()).toBe('new render + old state + 20')
      })
    })
  })
})
