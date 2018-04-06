import React from 'react'
import PropTypes from 'prop-types'
import logger from './logger'
import { get as getGeneration } from './global/generation'
import { renderReconciler } from './reconciler/proxyAdapter'
import { flushScheduledUpdates } from './reconciler'

class AppContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      error: null,
      generation: 0,
    }
  }

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

  shouldComponentUpdate(prevProps, prevState) {
    // Don't update the component if the state had an error and still has one.
    // This allows to break an infinite loop of error -> render -> error -> render
    // https://github.com/gaearon/react-hot-loader/issues/696
    if (prevState.error && this.state.error) {
      return false
    }

    return true
  }

  componentDidCatch(error) {
    logger.error(error)
    this.setState({ error })
  }

  render() {
    const { error } = this.state

    if (this.props.errorReporter && error) {
      return <this.props.errorReporter error={error} />
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
}

export default AppContainer
