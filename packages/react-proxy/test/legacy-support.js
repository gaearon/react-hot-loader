import supportsProtoAssignment from '../src/supportsProtoAssignment';
import createClassProxy from '../src/createClassProxy'
import expect from 'expect';

describe('legacy support', () => {

  it ('will not create proxy for an entity with no __proto__ value', () => {
    let noPrototype = Object.create(null);

    expect(supportsProtoAssignment(noPrototype)).toEqual(false);
  });

  it ('wraps unsupported entities', () => {
    let noPrototype = Object.create(null);
    let proxy = createClassProxy(noPrototype);

    expect(proxy.get()).toEqual(noPrototype);
  });

  it ('updates the reference when a component changes', () => {
    let noPrototype = Object.create(null);
    let proxy = createClassProxy(noPrototype);
    let next = {};

    proxy.update(next);

    expect(proxy.get()).toEqual(next);
  });

});
