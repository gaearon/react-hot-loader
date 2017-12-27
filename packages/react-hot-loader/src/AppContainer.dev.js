import React from 'react'
import PropTypes from 'prop-types'
import { getGeneration } from './updateCounter'
import hydrate from './reconciler/reactHydrate'
import hotReplacementRender from './reconciler/hotReplacementRender'
import './patch.dev'

class AppContainer extends React.Component {
  constructor(props) {
    super(props)

    if (typeof __REACT_HOT_LOADER__ !== 'undefined') {
      __REACT_HOT_LOADER__.warnings = props.warnings
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

      // perform sandboxed render to find similarities between new and old code
      hotReplacementRender(this, hydrate(this))
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

  componentDidCatch(error) {
    this.setState({ error })
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
}

AppContainer.defaultProps = {
  warnings: true,
}

export default AppContainer
