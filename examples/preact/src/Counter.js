import { h, render, Component } from 'preact'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

class Counter extends Component {
  state = { count: Math.round(Math.random() * 10) }

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
    return <div>100:{this.state.count}:1</div>
  }
}

export default Counter
