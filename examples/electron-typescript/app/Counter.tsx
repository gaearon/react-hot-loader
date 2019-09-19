import * as React from 'react'

class Counter extends React.Component<{}, { count: number }> {
  interval: number

  constructor(props : any) {
    super(props)
    this.state = { count: 0 }
  }

  componentDidMount() {
    this.interval = window.setInterval(
      () => this.setState(prevState => ({ count: prevState.count + 1 })),
      200,
    )
  }

  generateString1() {
    return "1"
  }

  generateString2 = ()  => {
    return "1"
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    return <span>{this.state.count} - {this.generateString1()} - {this.generateString2()}</span>
  }
}

export default Counter
