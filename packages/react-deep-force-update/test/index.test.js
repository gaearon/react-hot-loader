import React, { Component } from 'react'
import createReactClass from 'create-react-class'
import { renderIntoDocument } from 'react-dom/test-utils'
import deepForceUpdate from '../src'

let calls = 0

const Dummy = ({ children }) => <div>{children}</div>

class Noop extends Component {
  render() {
    return null
  }
}

class Modern extends Component {
  render() {
    return <Dummy calls={++calls}>{this.props.children}</Dummy>
  }
}

class ModernStrict extends Component {
  shouldComponentUpdate() {
    return false
  }
  render() {
    return <Dummy calls={++calls}>{this.props.children}</Dummy>
  }
}

const Classic = createReactClass({
  render() {
    return <Dummy calls={++calls}>{this.props.children}</Dummy>
  },
})

const ClassicStrict = createReactClass({
  shouldComponentUpdate() {
    return false
  },

  render() {
    return <Dummy calls={++calls}>{this.props.children}</Dummy>
  },
})

const Pure = ({ children }) => <Dummy calls={++calls}>{children}</Dummy>

class PureWrapper extends Component {
  render() {
    return <Pure>{this.props.children}</Pure>
  }
}

class PureWrapperStrict extends Component {
  shouldComponentUpdate() {
    return false
  }

  render() {
    return <Pure>{this.props.children}</Pure>
  }
}

describe('force update', () => {
  function expectShallowUpdate(Type) {
    calls = 0
    const instance = renderIntoDocument(<Type />)
    expect(calls).toEqual(1)
    deepForceUpdate(instance)
    expect(calls).toEqual(2)
  }

  function expectNoUpdate(TypeA, TypeB) {
    calls = 0
    const instance = renderIntoDocument(
      <TypeA>
        {' '}
        {/* 1 */}
        {'text'}
        {42}
        <div>
          <TypeB>
            {' '}
            {/* 2 */}
            <TypeA /> {/* 3 */}
            <Noop />
          </TypeB>
        </div>
        {[
          <TypeB key="a">
            {' '}
            {/* 4 */}
            <div>
              <TypeA>yo</TypeA> {/* 5 */}
            </div>
          </TypeB>,
          <TypeA key="b"> {/* 6 */}</TypeA>,
        ]}
      </TypeA>,
    )
    expect(calls).toEqual(6)
    deepForceUpdate(instance, () => false, () => calls++)
    expect(calls).toEqual(6)
    let onUpdateCalls = 6
    deepForceUpdate(instance, () => true, () => onUpdateCalls++)
    expect(onUpdateCalls).toBeGreaterThan(calls)
  }

  function expectDeepUpdate(TypeA, TypeB) {
    calls = 0
    const instance = renderIntoDocument(
      <TypeA>
        {' '}
        {/* 1 */}
        {'text'}
        {42}
        <div>
          <TypeB>
            {' '}
            {/* 2 */}
            <TypeA /> {/* 3 */}
            <Noop />
          </TypeB>
        </div>
        {[
          <TypeB key="a">
            {' '}
            {/* 4 */}
            <div>
              <TypeA>yo</TypeA> {/* 5 */}
            </div>
          </TypeB>,
          <TypeA key="b"> {/* 6 */}</TypeA>,
        ]}
      </TypeA>,
    )
    expect(calls).toEqual(6)
    deepForceUpdate(instance)
    expect(calls).toEqual(12)
  }

  it('updates modern', () => {
    expectShallowUpdate(Modern)
  })

  it('updates modern deep', () => {
    expectDeepUpdate(Modern, Modern)
  })

  it('updates modern strict', () => {
    expectShallowUpdate(ModernStrict)
  })

  it('updates modern strict deep', () => {
    expectDeepUpdate(ModernStrict, ModernStrict)
  })

  it('updates classic', () => {
    expectShallowUpdate(Classic)
  })

  it('updates classic deep', () => {
    expectDeepUpdate(Classic, Classic)
  })

  it('updates classic strict', () => {
    expectShallowUpdate(ClassicStrict)
  })

  it('updates classic strict deep', () => {
    expectDeepUpdate(ClassicStrict, ClassicStrict)
  })

  it('updates pure', () => {
    expectShallowUpdate(PureWrapper)
  })

  it('updates pure deep', () => {
    expectDeepUpdate(PureWrapper, PureWrapper)
  })

  it('updates pure strict', () => {
    expectShallowUpdate(PureWrapperStrict)
  })

  it('updates pure strict deep', () => {
    expectDeepUpdate(PureWrapperStrict, PureWrapperStrict)
  })

  it('updates mixed strict deep', () => {
    expectDeepUpdate(ClassicStrict, ModernStrict)
    expectDeepUpdate(ClassicStrict, PureWrapperStrict)
    expectDeepUpdate(ModernStrict, ClassicStrict)
    expectDeepUpdate(ModernStrict, PureWrapperStrict)
    expectDeepUpdate(PureWrapperStrict, ClassicStrict)
    expectDeepUpdate(PureWrapperStrict, ModernStrict)
  })

  it('respects shouldUpdate and onUpdate arguments', () => {
    expectNoUpdate(PureWrapperStrict, PureWrapperStrict)
  })
})
