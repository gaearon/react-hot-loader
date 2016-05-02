import '../../src/patch.dev';
import resolveType from '../../src/resolveType';
import expect from 'expect';

const RHL = global.__REACT_HOT_LOADER__;
function a1() {}
function a2() {}
function a3() {}
function b1() {}
function b2() {}

describe('resolveType', () => {
  beforeEach(() => {
    RHL.reset();
  });

  it('is identity for unrecognized types', () => {
    expect(resolveType()).toBe(undefined);
    expect(resolveType(42)).toBe(42);
    expect(resolveType('div')).toBe('div');
    expect(resolveType(a1)).toBe(a1);
  });

  it('resolves registered types by their last ID', () => {
    RHL.register('a', a1);
    expect(resolveType(a1)).toNotBe(a1);
    const a = resolveType(a1);
    expect(a).toBeA('function');
    expect(resolveType(a)).toBe(a);

    RHL.register('a', a2);
    expect(resolveType(a1)).toBe(a);
    expect(resolveType(a2)).toBe(a);
    expect(resolveType(a)).toBe(a);

    RHL.register('a', a3);
    expect(resolveType(a1)).toBe(a);
    expect(resolveType(a2)).toBe(a);
    expect(resolveType(a3)).toBe(a);
    expect(resolveType(a)).toBe(a);

    RHL.register('b', b1);
    const b = resolveType(b1);
    expect(resolveType(a1)).toBe(a);
    expect(resolveType(a2)).toBe(a);
    expect(resolveType(a3)).toBe(a);
    expect(resolveType(a)).toBe(a);
    expect(resolveType(b1)).toBe(b);
    expect(resolveType(b)).toBe(b);

    RHL.register('b', b2);
    expect(resolveType(a1)).toBe(a);
    expect(resolveType(a2)).toBe(a);
    expect(resolveType(a3)).toBe(a);
    expect(resolveType(a)).toBe(a);
    expect(resolveType(b1)).toBe(b);
    expect(resolveType(b2)).toBe(b);
    expect(resolveType(b)).toBe(b);
  });
});