import React from 'react'

const ComponentA = () => <div>A</div>
const ComponentB = () => <div>B</div>

class Counter extends React.Component {
  state = { count: 0 }

  componentDidMount() {
    if (!this.props.children) {
      // return;
    }
    // return;
    this.interval = setInterval(
      () => this.setState(prevState => ({ count: prevState.count + 1 })),
      2000,
    )
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    return (
      <div>
        #{this.state.count}
        {this.props.children &&
          React.cloneElement(this.props.children, {
            counter: this.state.count,
          })}
        {this.state.count % 2 ? 'a' : 'b'}
        {this.state.count % 2 ? <ComponentA /> : <ComponentB />}
      </div>
    )
  }
}

export default Counter
