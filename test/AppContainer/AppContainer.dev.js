import './setup'
import React, {Component} from 'react'
import expect, {createSpy} from 'expect'
import {mount} from 'enzyme'

import AppContainer from '../../src/AppContainer.dev'

const tag = (comp, name) => comp.__source = { fileName: name, localName: name }

describe('<AppContainer />', () => {
  describe('when passed children', () => {
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

    it('force updates the tree when receiving the same', () => {
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
      wrapper.setProps({children: <App />})
      expect(spy.calls.length).toBe(2)
    })

    it('force updates the tree when receiving different', () => {
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
  })

  describe('when passed component prop', () => {
    it('renders it', () => {
      const spy = createSpy()
      class App extends Component {
        render() {
          spy()
          return <div>hey</div>
        }
      }
      tag(App, 'App')

      const wrapper = mount(<AppContainer component={App}></AppContainer>)
      expect(wrapper.find('App').length).toBe(1)
      expect(wrapper.contains(<div>hey</div>)).toBe(true)
      expect(spy.calls.length).toBe(1)
    })

    it('force updates the tree when receiving the same', () => {
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

      const wrapper = mount(<AppContainer component={App}></AppContainer>)
      expect(spy.calls.length).toBe(1)
      wrapper.setProps({component: App})
      expect(spy.calls.length).toBe(2)
    })

    it('force updates the tree when receiving different', () => {
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

      const wrapper = mount(<AppContainer component={App}></AppContainer>)
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
        wrapper.setProps({component: App})
      }

      expect(spy.calls.length).toBe(2)
      expect(wrapper.contains(<div>ho</div>)).toBe(true)
    })
  })
})
