import React from 'react'
import * as r from 'recompose'

const Counter = r.compose(
  r.pure,
  r.withProps({ style: { color: 'red' } }),
  r.withState('count', 'setCount', 0),
  r.lifecycle({
    componentDidMount() {
      this.interval = setInterval(() => this.props.setCount(this.props.count + 1), 200)
    },

    componentWillUnmount() {
      clearInterval(this.interval)
    },
  }),
)(({ style, count }) => <div style={style}>{count}</div>)

export default Counter
