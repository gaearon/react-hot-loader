import '../../src/patch.dev';
import resolveType from '../../src/resolveType';
import expect from 'expect';

describe('resolveType', () => {
  it('is identity for unrecognized types', () => {
    expect(resolveType()).toBe(undefined);
    expect(resolveType(42)).toBe(42);
    expect(resolveType('div')).toBe('div');
    expect(resolveType(expect)).toBe(expect);
  });
});