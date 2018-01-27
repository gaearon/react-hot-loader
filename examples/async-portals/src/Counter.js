import React from 'react'

const RAND = Math.round(Math.random() * 1000)

class Counter extends React.Component {
  state = { count: 0 }

  componentDidMount() {
    this.setState({
      count: RAND,
    })
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    return this.state.count
  }
}

export default Counter
