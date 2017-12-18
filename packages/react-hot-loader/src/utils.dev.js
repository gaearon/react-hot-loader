import React, { Component } from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'
import AppContainer from './AppContainer.dev'

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'

const copyReactProp = (source, target) => {
  hoistNonReactStatic(target, source)
  target.displayName = `HotExported${getDisplayName(source)}`
  target.WrappedComponent = source

  target.propTypes = source.contextTypes
  target.childContextTypes = source.childContextTypes
  target.contextTypes = source.contextTypes
}

const makeHotExport = (sourceModule, getInstances) => {
  const updateInstances = () => {
    getInstances().forEach(inst => inst.forceUpdate())
  }

  const thenUpdateInstances = () => Promise.resolve(true).then(updateInstances)

  if (sourceModule.hot) {
    sourceModule.hot.accept(() => {
      // Mark as self-accepted for Webpack
      // Update instances for parsel
      thenUpdateInstances()
    })

    // webpack way
    if (sourceModule.hot.addStatusHandler) {
      if (sourceModule.hot.status() === 'idle') {
        sourceModule.hot.addStatusHandler(status => {
          if (status === 'apply') {
            thenUpdateInstances()
          }
        })
      }
    }
  }
}

export const hotExported = (sourceModule, WrappedComponent, props = {}) => {
  let instances = []

  class ExportedComponent extends Component {
    componentWillMount() {
      instances.push(this)
    }

    componentWillUnmount() {
      instances = instances.filter(a => a !== this)
    }

    render() {
      return (
        <AppContainer {...props}>
          <WrappedComponent {...this.props} />
        </AppContainer>
      )
    }
  }

  copyReactProp(WrappedComponent, ExportedComponent)

  makeHotExport(sourceModule, () => instances)

  // TODO: Ensure that all exports from this file are react components.

  return ExportedComponent
}

// TODO: refactor for Reconcile branch
export const compareComponents = (a, b) => a === b
