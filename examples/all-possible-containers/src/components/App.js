// @flow
import React from 'react'

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

class App extends React.Component {
  state = {
    error: null,
    errorInfo: null,
    open: false,
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  render() {
    const { open, error, errorInfo } = this.state

    return error ? (
      <ErrorBoundary error={error} errorInfo={errorInfo} />
    ) : (
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
        </React.Fragment>
      </div>
    )
  }
}

let ExportedApp = App

if (__DEV__) {
  //const { hot }  = require('react-hot-loader');
  const { hot, setConfig } = require('react-hot-loader')
  setConfig({ logLevel: 'debug' })
  ExportedApp = hot(module)(App)
}

export default ExportedApp
