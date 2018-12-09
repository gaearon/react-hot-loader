import React from 'react'
import { hot } from 'react-hot-loader'

class Counter extends React.Component {
  state = { count: 0 }

  componentDidMount() {
    //return;
    this.interval = setInterval(
      () => this.setState(prevState => ({ count: prevState.count + 2 })),
      200,
    )
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    return <div>2#{this.state.count}</div>
  }
}

export default Counter
