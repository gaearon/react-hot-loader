import supportsProtoAssignment from '../src/supportsProtoAssignment';
import createClassProxy from '../src/createClassProxy'
import expect from 'expect';

describe('legacy support', () => {
  it('will not create proxy for an entity with no __proto__ value', () => {
    const noPrototype = Object.create(null);
    expect(supportsProtoAssignment(noPrototype)).toEqual(false);
  });

  it('wraps unsupported entities', () => {
    const noPrototype = Object.create(null);
    const proxy = createClassProxy(noPrototype);
    expect(proxy.get()).toEqual(noPrototype);
  });

  it('updates the reference when a component changes', () => {
    const noPrototype = Object.create(null);
    const proxy = createClassProxy(noPrototype);
    const next = {};

    proxy.update(next);
    expect(proxy.get()).toEqual(next);
  });
});
