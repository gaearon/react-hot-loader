import React from 'react';
import { connect } from 'react-redux';

export class MyComponent1 extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

export const MyComponent = connect(state => state, undefined, undefined, { pure: false })(MyComponent1);
