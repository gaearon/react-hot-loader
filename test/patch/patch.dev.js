import '../../src/patch.dev';
import expect from 'expect';
import React from 'react';

const RHL = global.__REACT_HOT_LOADER__;
function A1() {}
function A2() {}
function A3() {}
function B1() {}
function B2() {}

describe('patch', () => {
  beforeEach(() => {
    RHL.reset();
  });

  it('is identity for unrecognized types', () => {
    expect(<div />.type).toBe('div');
    expect(<A1 />.type).toBe(A1);
  });

  it('resolves registered types by their last ID', () => {
    RHL.register('a', A1);
    expect(<A1 />.type).toNotBe(A1);
    const A = <A1 />.type;
    expect(A).toBeA('function');
    expect(<A />.type).toBe(A);

    RHL.register('a', A2);
    expect(<A1 />.type).toBe(A);
    expect(<A2 />.type).toBe(A);
    expect(<A />.type).toBe(A);

    RHL.register('a', A3);
    expect(<A1 />.type).toBe(A);
    expect(<A2 />.type).toBe(A);
    expect(<A3 />.type).toBe(A);
    expect(<A />.type).toBe(A);

    RHL.register('b', B1);
    const B = <B1 />.type;
    expect(<A1 />.type).toBe(A);
    expect(<A2 />.type).toBe(A);
    expect(<A3 />.type).toBe(A);
    expect(<A />.type).toBe(A);
    expect(<B1 />.type).toBe(B);
    expect(<B />.type).toBe(B);

    RHL.register('b', B2);
    expect(<A1 />.type).toBe(A);
    expect(<A2 />.type).toBe(A);
    expect(<A3 />.type).toBe(A);
    expect(<A />.type).toBe(A);
    expect(<B1 />.type).toBe(B);
    expect(<B2 />.type).toBe(B);
    expect(<B />.type).toBe(B);
  });

  it('passes props through', () => {
    expect(<div x={42} y='lol' />.props).toEqual({
      x: 42,
      y: 'lol'
    });
    expect(<A1 x={42} y='lol' />.props).toEqual({
      x: 42,
      y: 'lol'
    });

    RHL.register('b', B1);
    expect(<B1 x={42} y='lol' />.props).toEqual({
      x: 42,
      y: 'lol'
    });
    RHL.register('b', B2);
    expect(<B2 x={42} y='lol' />.props).toEqual({
      x: 42,
      y: 'lol'
    });
  });

  it('passes children through', () => {
    expect(<div>{'Hi'}{'Bye'}</div>.props.children).toEqual([
      'Hi',
      'Bye'
    ]);
    expect(<A1>{'Hi'}{'Bye'}</A1>.props.children).toEqual([
      'Hi',
      'Bye'
    ]);

    RHL.register('b', B1);
    expect(<B1>{'Hi'}{'Bye'}</B1>.props.children).toEqual([
      'Hi',
      'Bye'
    ]);
    RHL.register('b', B2);
    expect(<B2>{'Hi'}{'Bye'}</B2>.props.children).toEqual([
      'Hi',
      'Bye'
    ]);
  });
});