import React, { Component } from 'react'
import { hot } from 'react-hot-loader'
import { observer } from 'mobx-react'
import { observable } from 'mobx'

class Counter extends React.Component {
  state = { count: Math.round(Math.random() * 1000) }

  componentDidMount() {
    //this.interval = setInterval(this.increment, 200)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  increment = () => {
    this.setState(prevState => ({ count: prevState.count + 1 }))
  }

  render() {
    return this.state.count
  }
}

class Comp extends Component {
  state = {
    obsObj: null,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return { obsObj: nextProps.obsObj }
  }

  componentDidMount() {
    //setInterval(() => this.setState({update: 1}), 5000);
  }

  render() {
    const { prop1 } = this.state.obsObj || {}
    return (
      <div style={{ border: '10px solid red' }}>
        {prop1}
        <Counter />
      </div>
    )
  }
}

const ObsComp = observer(Comp)

class App extends Component {
  @observable
  obj = {
    prop1: 'Example',
  }

  render() {
    return (
      <div>
        <ObsComp obsObj={this.obj} />
      </div>
    )
  }
}

export default App
