// @flow
import { hot } from 'react-hot-loader/root'
import React from 'react'

import Context from '../context'
import Counter from './Counter'

import ErrorBoundary from './ErrorBoundary'
import ModalComponent from './ModalComponent'

import ClassComponent from './ClassComponent'
import FunctionComponent from './FunctionComponent'
import PureClassComponent from './PureClassComponent'
import ConsumerClassComponent from './ConsumerClassComponent'
import ConsumerFunctionComponent from './ConsumerFunctionComponent'
import ConsumerPureClassComponent from './ConsumerPureClassComponent'
import ChildrenAsFunctionExample from './ChildrenAsFunctionExample'
import ConsumerConnectedComponent from './ConsumerConnectedComponent'
import ConnectedChildrenAFComponent from './ConnectedChildrenAFComponent'
import FunctionConsumerPureClassComponent from './FunctionConsumerPureClassComponent'
import { EDIT_ME } from './_editMe'

const Secret = (() => {
  const A = () => (
    <div>
      component A <Counter />
    </div>
  )
  const B = () => 'wrong'
  return { A, B }
})()

class App extends React.Component {
  state = {
    error: null,
    errorInfo: null,
    open: false,
  }

  render() {
    const { open, error, errorInfo } = this.state
    const { A, B } = Secret

    return (
      <div>
        <React.Fragment>
          <fieldset>
            <legend>App Content</legend>
            {EDIT_ME}
          </fieldset>
          <ClassComponent />
          <FunctionComponent />
          <PureClassComponent />
          <ConsumerClassComponent />
          <ConsumerFunctionComponent />
          <ConsumerPureClassComponent />
          <ChildrenAsFunctionExample />
          <ConsumerConnectedComponent />
          <ConnectedChildrenAFComponent />
          <FunctionConsumerPureClassComponent />
          <button onClick={() => this.setState({ open: true })}>
            Open Modal
          </button>
          {open && (
            <ModalComponent
              onRequestClose={() => this.setState({ open: false })}
            />
          )}
          <div>
            <Context.Provider value="42">
              <Context.Consumer>
                {value => (value === '42' ? <A /> : <B />)}
              </Context.Consumer>
            </Context.Provider>
            <PureClassComponent />
          </div>
        </React.Fragment>
      </div>
    )
  }
}

let ExportedApp = App

if (__DEV__) {
  const { setConfig } = require('react-hot-loader')
  setConfig({
    logLevel: 'debug',
    errorReporter: ErrorBoundary,
  })
  ExportedApp = hot(App)
}

export default ExportedApp
