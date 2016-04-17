import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

function createModernFixtures() {
  class StaticProperty extends Component {
    static answer = 42;

    render() {
      return (
        <div>
          {StaticProperty.answer}
          {this.constructor.answer}
        </div>
      );
    }
  }

  class StaticPropertyUpdate extends Component {
    static answer = 43;

    render() {
      return (
        <div>
          {StaticPropertyUpdate.answer}
          {this.constructor.answer}
        </div>
      );
    }
  }

  class StaticPropertyRemoval extends Component {
    render() {
      return (
        <div>
          {StaticPropertyRemoval.answer}
          {this.constructor.answer}
        </div>
      );
    }
  }

  class PropTypes extends Component {
    static propTypes = {
      something: React.PropTypes.number
    };

    static contextTypes = {
      something: React.PropTypes.number
    };

    static childContextTypes = {
      something: React.PropTypes.number
    };
  }

  class PropTypesUpdate extends Component {
    static propTypes = {
      something: React.PropTypes.string
    };

    static contextTypes = {
      something: React.PropTypes.string
    };

    static childContextTypes = {
      something: React.PropTypes.string
    };
  }

  return {
    StaticProperty,
    StaticPropertyUpdate,
    StaticPropertyRemoval,
    PropTypes,
    PropTypesUpdate
  };
}

function createClassicFixtures() {
  const StaticProperty = React.createClass({
    statics: {
      answer: 42
    },

    render() {
      return (
        <div>
          {StaticProperty.answer}
          {this.constructor.answer}
        </div>
      );
    }
  });

  const StaticPropertyUpdate = React.createClass({
    statics: {
      answer: 43
    },

    render() {
      return (
        <div>
          {StaticPropertyUpdate.answer}
          {this.constructor.answer}
        </div>
      );
    }
  });

  const StaticPropertyRemoval = React.createClass({
    render() {
      return (
        <div>
          {StaticPropertyRemoval.answer}
          {this.constructor.answer}
        </div>
      );
    }
  });

  const PropTypes = React.createClass({
    render() {},

    propTypes: {
      something: React.PropTypes.number
    },

    contextTypes: {
      something: React.PropTypes.number
    },

    childContextTypes: {
      something: React.PropTypes.number
    }
  });

  const PropTypesUpdate = React.createClass({
    render() {},

    propTypes: {
      something: React.PropTypes.string
    },

    contextTypes: {
      something: React.PropTypes.string
    },

    childContextTypes: {
      something: React.PropTypes.string
    }
  });

  return {
    StaticProperty,
    StaticPropertyUpdate,
    StaticPropertyRemoval,
    PropTypes,
    PropTypesUpdate
  };
}

describe('static property', () => {
  let renderer;
  let warnSpy;

  beforeEach(() => {
    renderer = createShallowRenderer();
    warnSpy = expect.spyOn(console, 'error').andCallThrough();
  });

  afterEach(() => {
    warnSpy.destroy();
    expect(warnSpy.calls.length).toBe(0);
  });

  function runCommonTests(createFixtures) {
    let StaticProperty;
    let StaticPropertyUpdate;
    let StaticPropertyRemoval;
    let PropTypes;
    let PropTypesUpdate;

    beforeEach(() => {
      ({
        StaticProperty,
        StaticPropertyUpdate,
        StaticPropertyRemoval,
        PropTypes,
        PropTypesUpdate
      } = createFixtures());
    });

    it('is available on both classes', () => {
      const proxy = createProxy(StaticProperty);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([42, 42]);
      expect(StaticProperty.answer).toEqual(42);
      expect(Proxy.answer).toEqual(42);
    });

    it('is own on both classes', () => {
      const proxy = createProxy(StaticProperty);
      const Proxy = proxy.get();
      expect(StaticProperty.hasOwnProperty('answer')).toEqual(true);
      expect(Proxy.hasOwnProperty('answer')).toEqual(true);
    });

    it('is changed when not reassigned', () => {
      const proxy = createProxy(StaticProperty);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([42, 42]);
      expect(StaticProperty.answer).toEqual(42);
      expect(Proxy.answer).toEqual(42);

      proxy.update(StaticPropertyUpdate);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([43, 43]);
      expect(StaticPropertyUpdate.answer).toEqual(43);
      expect(Proxy.answer).toEqual(43);

      proxy.update(StaticPropertyRemoval);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([undefined, undefined]);
      expect(StaticPropertyRemoval.answer).toEqual(undefined);
      expect(Proxy.answer).toEqual(undefined);
    });

    it('is changed for propTypes, contextTypes, childContextTypes', () => {
      const proxy = createProxy(PropTypes);
      const PropTypesProxy = proxy.get();
      expect(PropTypesProxy.propTypes.something).toEqual(React.PropTypes.number);
      expect(PropTypesProxy.contextTypes.something).toEqual(React.PropTypes.number);
      expect(PropTypesProxy.childContextTypes.something).toEqual(React.PropTypes.number);

      proxy.update(PropTypesUpdate);
      expect(PropTypesProxy.propTypes.something).toEqual(React.PropTypes.string);
      expect(PropTypesProxy.contextTypes.something).toEqual(React.PropTypes.string);
      expect(PropTypesProxy.childContextTypes.something).toEqual(React.PropTypes.string);
    });

    it('is not changed when reassigned on initial class (declared)', () => {
      const proxy = createProxy(StaticProperty);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([42, 42]);

      StaticProperty.answer = 100;
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([100, 100]);
      expect(StaticProperty.answer).toEqual(100);
      expect(Proxy.answer).toEqual(42); // Proxy gets synced on update()

      proxy.update(StaticPropertyUpdate);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([100, 100]);
      expect(StaticPropertyUpdate.answer).toEqual(100);
      expect(Proxy.answer).toEqual(100);

      proxy.update(StaticPropertyRemoval);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([100, 100]);
      expect(StaticPropertyRemoval.answer).toEqual(100);
      expect(Proxy.answer).toEqual(100);
    });

    it('is not changed when reassigned on initial class (undeclared)', () => {
      const proxy = createProxy(StaticPropertyRemoval);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([undefined, undefined]);

      StaticPropertyRemoval.answer = 100;
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([100, 100]);
      expect(Proxy.answer).toEqual(undefined); // Proxy gets synced on update()

      proxy.update(StaticPropertyUpdate);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([100, 100]);
      expect(StaticPropertyUpdate.answer).toEqual(100);
      expect(Proxy.answer).toEqual(100);

      proxy.update(StaticProperty);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual([100, 100]);
      expect(StaticPropertyRemoval.answer).toEqual(100);
      expect(Proxy.answer).toEqual(100);
    });
  }

  describe('classic', () => {
    runCommonTests(createClassicFixtures);
  });

  describe('modern', () => {
    runCommonTests(createModernFixtures);
  });
});