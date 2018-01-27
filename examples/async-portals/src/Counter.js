import React from 'react'

const RAND = Math.round(Math.random() * 1000)

class Counter extends React.Component {
  state = { count: 0 }
  gen = 0

  catch = 42

  componentDidMount() {
    this.setState({
      count: RAND,
    })
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    return (
      <span>
        +{this.state.count}:{this.gen++}
      </span>
    )
  }
}

export default Counter
