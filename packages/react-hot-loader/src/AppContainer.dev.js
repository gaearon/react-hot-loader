import React, { Component } from 'react'
import PropTypes from 'prop-types'
import deepForceUpdate from 'react-deep-force-update'
import { getGeneration } from './updateCounter'
import hydrate from './reconciler/reactHydrate'
import hotReplacementRender from './reconciler/hotReplacementRender'

class AppContainer extends Component {
  constructor(props) {
    super(props)

    if (typeof __REACT_HOT_LOADER__ !== 'undefined') {
      if (props.warnings === false) {
        __REACT_HOT_LOADER__.warnings = props.warnings
      }
      if (props.reconciler === true) {
        __REACT_HOT_LOADER__.reconciler = props.reconciler
      }
    }

    this.state = {
      error: null,
      generation: 0,
    }
  }

  componentDidMount() {
    if (typeof __REACT_HOT_LOADER__ === 'undefined') {
      console.error(
        'React Hot Loader: It appears that "react-hot-loader/patch" ' +
          'did not run immediately before the app started. Make sure that it ' +
          'runs before any other code. For example, if you use Webpack, ' +
          'you can add "react-hot-loader/patch" as the very first item to the ' +
          '"entry" array in its config. Alternatively, you can add ' +
          'require("react-hot-loader/patch") as the very first line ' +
          'in the application code, before any other imports.',
      )
    }
  }

  componentWillReceiveProps() {
    if (this.state.generation !== getGeneration()) {
      // Hot reload is happening.

      this.setState({
        error: null,
        generation: getGeneration(),
      })

      if (__REACT_HOT_LOADER__.reconciler) {
        // perform sandboxed render to find similarities between new and old code
        hotReplacementRender(this, hydrate(this))
      } else {
        // Force-update the whole tree, including
        // components that refuse to update.
        deepForceUpdate(this)
      }
    }
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

  // This hook is going to become official in React 15.x.
  // In 15.0, it only catches errors on initial mount.
  // Later it will work for updates as well:
  // https://github.com/facebook/react/pull/6020
  /* eslint-disable camelcase */
  unstable_handleError(error) {
    this.componentDidCatch(error)
  }
  /* eslint-enable camelcase */

  componentDidCatch(error) {
    this.setState({
      error,
    })
  }

  render() {
    const { error } = this.state

    if (this.props.errorReporter && error) {
      console.error(error)
      return <this.props.errorReporter error={error} />
    } else if (error) {
      console.error(error)
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
  warnings: PropTypes.bool,
  reconciler: PropTypes.bool,
}

export default AppContainer
