import React, { Component } from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'
import AppContainer from './AppContainer.dev'
import reactHotLoader from './reactHotLoader'

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'

const createHoc = (SourceComponent, TargetComponent) => {
  hoistNonReactStatic(TargetComponent, SourceComponent)
  TargetComponent.displayName = `HotExported${getDisplayName(SourceComponent)}`
  return TargetComponent
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
    // register proxy for wrapped component
    reactHotLoader.register(
      WrappedComponent,
      getDisplayName(WrappedComponent),
      `RHL${sourceModule.id}`,
    )

    return createHoc(
      WrappedComponent,
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
      },
    )
  }
}

export default hot
