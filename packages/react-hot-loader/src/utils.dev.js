import React, { Component } from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'
import AppContainer from './AppContainer.dev'
import { getProxyByType } from './reconciler/proxies'

export const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'

const copyReactProp = (source, target) => {
  hoistNonReactStatic(target, source)
  target.displayName = `HotExported${getDisplayName(source)}`
  target.WrappedComponent = source

  target.propTypes = source.contextTypes
}

const makeHotExport = (sourceModule, getInstances) => {
  const updateInstances = () =>
    setTimeout(() => getInstances().forEach(inst => inst.forceUpdate()))

  if (sourceModule.hot) {
    // Mark as self-accepted for Webpack
    // Update instances for Parcel
    sourceModule.hot.accept(updateInstances)

    // Webpack way
    if (sourceModule.hot.addStatusHandler) {
      if (sourceModule.hot.status() === 'idle') {
        sourceModule.hot.addStatusHandler(status => {
          if (status === 'apply') {
            updateInstances()
          }
        })
      }
    }
  }
}

const hot = sourceModule => {
  let instances = []
  makeHotExport(sourceModule, () => instances)
  // TODO: Ensure that all exports from this file are react components.

  return WrappedComponent => {
    class ExportedComponent extends Component {
      componentWillMount() {
        instances.push(this)
      }

      componentWillUnmount() {
        instances = instances.filter(a => a !== this)
      }

      render() {
        return (
          <AppContainer>
            <WrappedComponent {...this.props} />
          </AppContainer>
        )
      }
    }

    copyReactProp(WrappedComponent, ExportedComponent)

    // register proxy for wrapped component
    __REACT_HOT_LOADER__.register(
      WrappedComponent,
      getDisplayName(WrappedComponent),
      `RHL${sourceModule.id}`,
    )

    return ExportedComponent
  }
}

const areComponentsEqual = (a, b) => getProxyByType(a) === getProxyByType(b)

export { hot, areComponentsEqual }
