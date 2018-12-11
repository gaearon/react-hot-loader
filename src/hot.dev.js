import React, { Component } from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'
import { getComponentDisplayName } from './internal/reactUtils'
import AppContainer from './AppContainer.dev'
import reactHotLoader from './reactHotLoader'
import {
  isOpened as isModuleOpened,
  hotModule,
  getLastModuleOpened,
} from './global/modules'
import logger from './logger'
import { clearExceptions, logException } from './errorReporter'

/* eslint-disable camelcase, no-undef */
const requireIndirect =
  typeof __webpack_require__ !== 'undefined' ? __webpack_require__ : require
/* eslint-enable */

const chargeFailbackTimer = id =>
  setTimeout(() => {
    const error = `hot update failed for module "${id}". Last file processed: "${getLastModuleOpened}".`
    logger.error(error)
    logException({
      toString: () => error,
    })
  }, 0)

const clearFailbackTimer = timerId => clearTimeout(timerId)

const createHoc = (SourceComponent, TargetComponent) => {
  hoistNonReactStatic(TargetComponent, SourceComponent)
  TargetComponent.displayName = `HotExported${getComponentDisplayName(
    SourceComponent,
  )}`
  return TargetComponent
}

const makeHotExport = sourceModule => {
  const updateInstances = () => {
    const module = hotModule(sourceModule.id)
    clearTimeout(module.updateTimeout)
    module.updateTimeout = setTimeout(() => {
      try {
        requireIndirect(sourceModule.id)
      } catch (e) {
        // just swallow
      }
      module.instances.forEach(inst => inst.forceUpdate())
    })
  }

  if (sourceModule.hot) {
    // Mark as self-accepted for Webpack (callback is an Error Handler)
    // Update instances for Parcel (callback is an Accept Handler)
    sourceModule.hot.accept(updateInstances)

    // Webpack way
    if (sourceModule.hot.addStatusHandler) {
      if (sourceModule.hot.status() === 'idle') {
        sourceModule.hot.addStatusHandler(status => {
          if (status === 'apply') {
            clearExceptions()
            updateInstances()
          }
        })
      }
    }
  }
}

const hot = sourceModule => {
  if (!sourceModule || !sourceModule.id) {
    // this is fatal
    throw new Error(
      'React-hot-loader: `hot` could not find the `id` property in the `module` you have provided',
    )
  }
  const moduleId = sourceModule.id
  const module = hotModule(moduleId)
  makeHotExport(sourceModule)

  clearExceptions()
  const failbackTimer = chargeFailbackTimer(sourceModule.id)

  // TODO: Ensure that all exports from this file are react components.

  return WrappedComponent => {
    clearFailbackTimer(failbackTimer)
    // register proxy for wrapped component
    reactHotLoader.register(
      WrappedComponent,
      getComponentDisplayName(WrappedComponent),
      `RHL${moduleId}`,
    )

    return createHoc(
      WrappedComponent,
      class ExportedComponent extends Component {
        componentDidMount() {
          module.instances.push(this)
        }

        componentWillUnmount() {
          if (isModuleOpened(sourceModule)) {
            const componentName = getComponentDisplayName(WrappedComponent)
            logger.error(
              `React-hot-loader: Detected AppContainer unmount on module '${moduleId}' update.\n` +
                `Did you use "hot(${componentName})" and "ReactDOM.render()" in the same file?\n` +
                `"hot(${componentName})" shall only be used as export.\n` +
                `Please refer to "Getting Started" (https://github.com/gaearon/react-hot-loader/).`,
            )
          }
          module.instances = module.instances.filter(a => a !== this)
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
