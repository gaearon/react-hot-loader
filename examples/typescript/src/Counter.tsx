import * as React from 'react'

class Counter extends React.Component<{}, { count: number }> {
  interval: number;

  constructor(props : any) {
    super(props)
    this.state = { count: 0 }
  }

  componentDidMount() {
    this.interval = setInterval(
      () => this.setState(prevState => ({ count: prevState.count + 1 })),
      200,
    )
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    return this.state.count
  }
}

export default Counter
