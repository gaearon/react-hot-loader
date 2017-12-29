/* eslint-env jest */

import React from 'react'
import '../lib/patch.dev'
import RHL from '../lib/reactHotLoader'

RHL.disableComponentProxy = true

function A1() {}
function A2() {}
function A3() {}
function B1() {}
function B2() {}

function runAllTests(useWeakMap) {
  describe('patch', () => {
    beforeEach(() => {
      RHL.reset(useWeakMap)
    })

    it('is identity for unrecognized types', () => {
      expect(<div />.type).toBe('div')
      expect(<A1 />.type).toBe(A1)
    })

    it('report proxy named duplicates', () => {
      const createUniqueComponent = variable => () => <div>123{variable}</div>
      const f1 = createUniqueComponent(1)
      const f2 = createUniqueComponent(2)
      f2.displayName = 'another'

      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      try {
        RHL.register(createUniqueComponent, 'f1', '/wow/test.js')
        React.createElement(f1)
        React.createElement(f1)
        expect(console.warn.mock.calls.length).toBe(0)
        RHL.register(createUniqueComponent, 'f1', '/wow/test.js')
        React.createElement(f2)
        expect(console.warn.mock.calls.length).toBe(0)
      } finally {
        spy.mockRestore()
      }
    })

    it('resolves registered types by their last ID', () => {
      RHL.register(A1, 'a', 'test.js')
      const A = <A1 />.type
      expect(A).not.toBe(A1)
      expect(A).toBeInstanceOf(Function)
      expect(<A />.type).toBe(A)

      RHL.register(A2, 'a', 'test.js')
      expect(<A1 />.type).toBe(A)
      expect(<A2 />.type).toBe(A)
      expect(<A />.type).toBe(A)

      RHL.register(A3, 'a', 'test.js')
      expect(<A1 />.type).toBe(A)
      expect(<A2 />.type).toBe(A)
      expect(<A3 />.type).toBe(A)
      expect(<A />.type).toBe(A)

      RHL.register(B1, 'b', 'test.js')
      const B = <B1 />.type
      expect(<A1 />.type).toBe(A)
      expect(<A2 />.type).toBe(A)
      expect(<A3 />.type).toBe(A)
      expect(<A />.type).toBe(A)
      expect(<B1 />.type).toBe(B)
      expect(<B />.type).toBe(B)

      RHL.register(B2, 'b', 'test.js')
      expect(<A1 />.type).toBe(A)
      expect(<A2 />.type).toBe(A)
      expect(<A3 />.type).toBe(A)
      expect(<A />.type).toBe(A)
      expect(<B1 />.type).toBe(B)
      expect(<B2 />.type).toBe(B)
      expect(<B />.type).toBe(B)
    })

    it('works with reexported types', () => {
      RHL.register(A1, 'a', 'test.js')
      RHL.register(A1, 'x', 'test2.js')

      const A = <A1 />.type
      expect(A.type).not.toBe(A1)
      expect(A).toBeInstanceOf(Function)
      expect(<A />.type).toBe(A)

      RHL.register(A2, 'a', 'test.js')
      RHL.register(A2, 'x', 'test2.js')
      expect(<A1 />.type).toBe(A)
      expect(<A2 />.type).toBe(A)
      expect(<A />.type).toBe(A)
    })

    it('passes props through', () => {
      expect(<div x={42} y="lol" />.props).toEqual({
        x: 42,
        y: 'lol',
      })
      expect(<A1 x={42} y="lol" />.props).toEqual({
        x: 42,
        y: 'lol',
      })

      RHL.register(B1, 'b', 'test.js')
      expect(<B1 x={42} y="lol" />.props).toEqual({
        x: 42,
        y: 'lol',
      })
      RHL.register(B2, 'b', 'test.js')
      expect(<B2 x={42} y="lol" />.props).toEqual({
        x: 42,
        y: 'lol',
      })
    })

    it('passes children through', () => {
      expect(
        (
          <div>
            {'Hi'}
            {'Bye'}
          </div>
        ).props.children,
      ).toEqual(['Hi', 'Bye'])
      expect(
        (
          <A1>
            {'Hi'}
            {'Bye'}
          </A1>
        ).props.children,
      ).toEqual(['Hi', 'Bye'])

      RHL.register(B1, 'b', 'test.js')
      expect(
        (
          <B1>
            {'Hi'}
            {'Bye'}
          </B1>
        ).props.children,
      ).toEqual(['Hi', 'Bye'])
      RHL.register(B2, 'b', 'test.js')
      expect(
        (
          <B2>
            {'Hi'}
            {'Bye'}
          </B2>
        ).props.children,
      ).toEqual(['Hi', 'Bye'])
    })
  })
}

runAllTests(true)
runAllTests(false)
