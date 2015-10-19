import React, { Component } from 'react';
import { renderIntoDocument } from 'react-addons-test-utils';
import expect from 'expect';
import deepForceUpdate from '../src';

let calls = 0;

class Noop extends Component {
  render() {
    return null;
  }
}

class Modern extends Component {
  render() {
    return <div calls={++calls}>{this.props.children}</div>;
  }
}

class ModernStrict extends Component {
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return <div calls={++calls}>{this.props.children}</div>;
  }
}

const Classic = React.createClass({
  render() {
    return <div calls={++calls}>{this.props.children}</div>;
  }
});

const ClassicStrict = React.createClass({
  shouldComponentUpdate() {
    return false;
  },

  render() {
    return <div calls={++calls}>{this.props.children}</div>;
  }
});

const Pure = ({ children }) => (
  <div calls={++calls}>{children}</div>
);

class PureWrapper extends Component {
  render() {
    return <Pure>{this.props.children}</Pure>;
  }
}

class PureWrapperStrict extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <Pure>{this.props.children}</Pure>;
  }
}

describe('force update', () => {
  function expectShallowUpdate(Type) {
    calls = 0;
    const instance = renderIntoDocument(<Type />);
    expect(calls).toEqual(1);
    deepForceUpdate(instance);
    expect(calls).toEqual(2);
  }

  function expectDeepUpdate(TypeA, TypeB) {
    calls = 0;
    const instance = renderIntoDocument(
      <TypeA> {/* 1 */}
        {'text'}
        {42}
        <div>
          <TypeB> {/* 2 */}
            <TypeA /> {/* 3 */}
            <Noop />
          </TypeB>
        </div>
        {[
          <TypeB key='a'> {/* 4 */}
            <div>
              <TypeA>yo</TypeA> {/* 5 */}
            </div>
          </TypeB>,
          <TypeA key='b'> {/* 6 */}
          </TypeA>
        ]}
      </TypeA>
    );
    expect(calls).toEqual(6);
    deepForceUpdate(instance);
    expect(calls).toEqual(12);
  }

  it('updates modern', () => {
    expectShallowUpdate(Modern);
  });

  it('updates modern deep', () => {
    expectDeepUpdate(Modern, Modern);
  });

  it('updates modern strict', () => {
    expectShallowUpdate(ModernStrict);
  });

  it('updates modern strict deep', () => {
    expectDeepUpdate(ModernStrict, ModernStrict);
  });

  it('updates classic', () => {
    expectShallowUpdate(Classic);
  });

  it('updates classic deep', () => {
    expectDeepUpdate(Classic, Classic);
  });

  it('updates classic strict', () => {
    expectShallowUpdate(ClassicStrict);
  });

  it('updates classic strict deep', () => {
    expectDeepUpdate(ClassicStrict, ClassicStrict);
  });

  it('updates pure', () => {
    expectShallowUpdate(PureWrapper);
  });

  it('updates pure deep', () => {
    expectDeepUpdate(PureWrapper, PureWrapper);
  });

  it('updates pure strict', () => {
    expectShallowUpdate(PureWrapperStrict);
  });

  it('updates pure strict deep', () => {
    expectDeepUpdate(PureWrapperStrict, PureWrapperStrict);
  });

  it('updates mixed strict deep', () => {
    expectDeepUpdate(ClassicStrict, ModernStrict);
    expectDeepUpdate(ClassicStrict, PureWrapperStrict);
    expectDeepUpdate(ModernStrict, ClassicStrict);
    expectDeepUpdate(ModernStrict, PureWrapperStrict);
    expectDeepUpdate(PureWrapperStrict, ClassicStrict);
    expectDeepUpdate(PureWrapperStrict, ModernStrict);
  });
});
