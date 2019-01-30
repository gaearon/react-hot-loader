import React from 'react'
import PropTypes from 'prop-types'
import defaultPolyfill, { polyfill } from 'react-lifecycles-compat'
import logger from './logger'
import { get as getGeneration, hotComparisonOpen } from './global/generation'
import configuration from './configuration'
import { EmptyErrorPlaceholder, logException } from './errorReporter'

class AppContainer extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.generation !== getGeneration()) {
      // Hot reload is happening.
      return {
        error: null,
        generation: getGeneration(),
      }
    }
    return null
  }

  state = {
    error: null,
    errorInfo: null,
    // eslint-disable-next-line react/no-unused-state
    generation: 0,
  }

  shouldComponentUpdate(prevProps, prevState) {
    // Don't update the component if the state had an error and still has one.
    // This allows to break an infinite loop of error -> render -> error -> render
    // https://github.com/gaearon/react-hot-loader/issues/696
    if (prevState.error && this.state.error) {
      return false
    }

    return true
  }

  componentDidCatch(error, errorInfo) {
    logger.error(error)

    if (!hotComparisonOpen()) {
      // do not log error outside of HMR cycle
      return
    }
    const { errorReporter = configuration.errorReporter } = this.props
    if (!errorReporter) {
      logException(error, errorInfo, this)
    }
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    const { error, errorInfo } = this.state

    const {
      errorReporter: ErrorReporter = configuration.errorReporter ||
        EmptyErrorPlaceholder,
    } = this.props

    if (error && this.props.errorBoundary) {
      return <ErrorReporter error={error} errorInfo={errorInfo} />
    }

    if (this.hotComponentUpdate) {
      this.hotComponentUpdate()
    } else {
      throw new Error('React-Hot-Loader: AppContainer should be patched')
    }

    return React.Children.only(this.props.children)
  }
}

AppContainer.propTypes = {
  children(props) {
    if (React.Children.count(props.children) !== 1) {
      return new Error(
        'Invalid prop "children" supplied to AppContainer. ' +
          'Expected a single React element with your app’s root component, e.g. <App />.',
      )
    }

    return undefined
  },
  errorReporter: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  errorBoundary: PropTypes.bool,
}

AppContainer.defaultProps = {
  errorBoundary: true,
}

//  trying first react-lifecycles-compat.polyfill, then trying react-lifecycles-compat, which could be .default
const realPolyfill = polyfill || defaultPolyfill
realPolyfill(AppContainer)

export default AppContainer
