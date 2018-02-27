import React from 'react'
import autobind from 'autobind-decorator'

@autobind
class Counter extends React.Component {
  state = { count: 0 }

  componentDidMount() {
    this.interval = setInterval(this.increment, 200)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  increment() {
    this.setState(prevState => ({ count: prevState.count + 1 }))
  }

  render() {
    return this.state.count
  }
}

export default Counter
