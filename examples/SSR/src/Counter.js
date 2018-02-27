import React from 'react'

const RAND = 1 //Math.round(Math.random() * 1000)

class Counter extends React.Component {
  state = { count: 0 }
  gen = 0

  componentDidMount() {
    this.setState({
      count: RAND,
    })
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    // gen should change. count - no.
    return (
      <span>
        {this.state.count}:{this.gen++}
      </span>
    )
  }
}

export default Counter
