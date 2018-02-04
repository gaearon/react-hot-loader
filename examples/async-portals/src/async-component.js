import React, { Component } from 'react'

class AsyncComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    this.load()
  }

  componentWillReceiveProps() {
    if (module.hot) {
      setImmediate(() => {
        this.load()
      })
    }
  }

  load() {
    return this.props.importer().then(payload => {
      this.setState({ AsyncComponent: payload.default })
    })
  }

  render() {
    const { AsyncComponent } = this.state

    if (AsyncComponent) {
      return <AsyncComponent {...this.props} />
    }
    return <div>async</div>
  }
}

export default AsyncComponent
