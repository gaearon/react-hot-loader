import React, { Component } from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'
import { getComponentDisplayName } from './internal/reactUtils'
import AppContainer from './AppContainer.dev'
import reactHotLoader from './reactHotLoader'
import { isModuleOpened } from './hotModule'
import logger from './logger'

const createHoc = (SourceComponent, TargetComponent) => {
  hoistNonReactStatic(TargetComponent, SourceComponent)
  TargetComponent.displayName = `HotExported${getComponentDisplayName(
    SourceComponent,
  )}`
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
      getComponentDisplayName(WrappedComponent),
      `RHL${sourceModule.id}`,
    )

    return createHoc(
      WrappedComponent,
      class ExportedComponent extends Component {
        componentWillMount() {
          instances.push(this)
        }

        componentWillUnmount() {
          if (isModuleOpened(sourceModule)) {
            const componentName = getComponentDisplayName(WrappedComponent)
            logger.error(
              `React-hot-loader: Detected AppContainer unmount on module '${
                sourceModule.id
              }' update.\n` +
                `Did you use "hot(${componentName})" and "ReactDOM.render()" in the same file?\n` +
                `"hot(${componentName})" shall only be used as export.\n` +
                `Please refer to "Getting Started" (https://github.com/gaearon/react-hot-loader/).`,
            )
          }
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
