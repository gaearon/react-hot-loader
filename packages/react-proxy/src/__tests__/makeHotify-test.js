import React, { Component } from 'react';
import createShallowRenderer from './createShallowRenderer';
import expect from 'expect.js';
import makeHotify from '../makeHotify';

class Bar {
  componentWillUnmount() {
    this.didUnmount = true;
  }

  render() {
    return <div>Bar</div>;
  }
}

class Baz {
  componentWillUnmount() {
    this.didUnmount = true;
  }

  render() {
    return <div>Baz</div>;
  }
}

class Foo {
  componentWillUnmount() {
    this.didUnmount = true;
  }

  render() {
    return <div>Foo</div>;
  }
}

class Counter1x extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
  }

  increment() {
    this.setState({
      counter: this.state.counter + 1
    });
  }

  render() {
    return <span>{this.state.counter}</span>;
  }
}

class Counter10x extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
  }

  increment() {
    this.setState({
      counter: this.state.counter + 10
    });
  }

  render() {
    return <span>{this.state.counter}</span>;
  }
}

class Counter100x extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
  }

  increment() {
    this.setState({
      counter: this.state.counter + 100
    });
  }

  render() {
    return <span>{this.state.counter}</span>;
  }
}

class CounterWithoutIncrementMethod extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
  }

  render() {
    return <span>{this.state.counter}</span>;
  }
}

class InstanceProperty {
  answer = 42;

  render() {
    return <div>{this.answer}</div>;
  }
}

class InstancePropertyUpdate {
  answer = 43;

  render() {
    return <div>{this.answer}</div>;
  }
}

class InstancePropertyRemoval {
  render() {
    return <div>{this.answer}</div>;
  }
}

class StaticProperty {
  static answer = 42;

  render() {
    return (
      <div>{this.constructor.answer}</div>
    );
  }
}

class StaticPropertyUpdate {
  static answer = 43;

  render() {
    return (
      <div>{this.constructor.answer}</div>
    );
  }
}

class StaticPropertyRemoval {
  render() {
    return (
      <div>{this.constructor.answer}</div>
    );
  }
}

class StaticMethod {
  static getAnswer() {
    return 42;
  };

  render() {
    return (
      <div>{this.constructor.getAnswer()}</div>
    );
  }
}

class StaticMethodUpdate {
  static getAnswer() {
    return 43;
  };

  render() {
    return (
      <div>{this.constructor.getAnswer()}</div>
    );
  }
}

class StaticMethodRemoval {
  render() {
    return (
      <div>{this.constructor.getAnswer()}</div>
    );
  }
}

class PropTypes {
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

class PropTypesUpdate {
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

describe('makeHotify', () => {
  let renderer;
  let hotify;

  beforeEach(() => {
    renderer = createShallowRenderer();
    hotify = makeHotify();
  });

  it('unmounts without hotify', () => {
    const barInstance = renderer.render(<Bar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');
    const bazInstance = renderer.render(<Baz />);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');
    expect(barInstance).to.not.equal(bazInstance);
    expect(barInstance.didUnmount).to.equal(true);
  });

  it('does not unmount when rendering new hotified versions', () => {
    const HotBar = hotify(Bar);
    const barInstance = renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    const HotBaz = hotify(Baz);
    const bazInstance = renderer.render(<HotBaz />);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');
    expect(barInstance).to.equal(bazInstance);
    expect(barInstance.didUnmount).to.equal(undefined);

    const HotFoo = hotify(Foo);
    const fooInstance = renderer.render(<HotFoo />);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
    expect(barInstance).to.equal(fooInstance);
    expect(barInstance.didUnmount).to.equal(undefined);
  });

  it('does not unmount when rendering old hotified versions', () => {
    const HotBar = hotify(Bar);
    const barInstance = renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    hotify(Baz);
    const bazInstance = renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');
    expect(barInstance).to.equal(bazInstance);
    expect(barInstance.didUnmount).to.equal(undefined);

    hotify(Foo);
    const fooInstance = renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
    expect(barInstance).to.equal(fooInstance);
    expect(barInstance.didUnmount).to.equal(undefined);
  });

  it('does not overwrite the hotified class', () => {
    const HotBar = hotify(Bar);
    const barInstance = renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    hotify(Baz);
    const realBarInstance = renderer.render(<Bar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');
    expect(barInstance).to.not.equal(realBarInstance);
    expect(barInstance.didUnmount).to.equal(true);
  });

  it('sets up constructor to match the type', () => {
    const HotBar = hotify(Bar);
    const barInstance = renderer.render(<HotBar />);
    expect(barInstance.constructor).to.equal(HotBar);
    expect(barInstance instanceof HotBar).to.equal(true);

    const HotBaz = hotify(Baz);
    expect(HotBar).to.equal(HotBaz);
    expect(barInstance.constructor).to.equal(HotBaz);
    expect(barInstance instanceof HotBaz).to.equal(true);
  });

  describe('instance method', () => {
    it('gets replaced', () => {
      const HotCounter = hotify(Counter1x);
      const instance = renderer.render(<HotCounter />);
      expect(renderer.getRenderOutput().props.children).to.equal(0);
      instance.increment();
      expect(renderer.getRenderOutput().props.children).to.equal(1);

      hotify(Counter10x);
      instance.increment();
      renderer.render(<HotCounter />);
      expect(renderer.getRenderOutput().props.children).to.equal(11);

      hotify(Counter100x);
      instance.increment();
      renderer.render(<HotCounter />);
      expect(renderer.getRenderOutput().props.children).to.equal(111);
    });

    it('gets replaced if bound', () => {
      const HotCounter = hotify(Counter1x);
      const instance = renderer.render(<HotCounter />);

      instance.increment = instance.increment.bind(instance);

      expect(renderer.getRenderOutput().props.children).to.equal(0);
      instance.increment();
      expect(renderer.getRenderOutput().props.children).to.equal(1);

      hotify(Counter10x);
      instance.increment();
      renderer.render(<HotCounter />);
      expect(renderer.getRenderOutput().props.children).to.equal(11);

      hotify(Counter100x);
      instance.increment();
      renderer.render(<HotCounter />);
      expect(renderer.getRenderOutput().props.children).to.equal(111);
    });

    /**
     * It is important to make deleted methods no-ops
     * so they don't crash if setTimeout-d or setInterval-d.
     */
    it('is detached and acts as a no-op if not reassigned and deleted', () => {
      const HotCounter = hotify(Counter1x);
      const instance = renderer.render(<HotCounter />);
      expect(renderer.getRenderOutput().props.children).to.equal(0);
      instance.increment();
      const savedIncrement = instance.increment;
      expect(renderer.getRenderOutput().props.children).to.equal(1);

      hotify(CounterWithoutIncrementMethod);
      expect(instance.increment).to.equal(undefined);
      savedIncrement.call(instance);
      renderer.render(<HotCounter />);
      expect(renderer.getRenderOutput().props.children).to.equal(1);
    });

    it('is attached and acts as a no-op if reassigned and deleted', () => {
      const HotCounter = hotify(Counter1x);
      const instance = renderer.render(<HotCounter />);

      instance.increment = instance.increment.bind(instance);

      expect(renderer.getRenderOutput().props.children).to.equal(0);
      instance.increment();
      expect(renderer.getRenderOutput().props.children).to.equal(1);

      hotify(CounterWithoutIncrementMethod);
      instance.increment();
      renderer.render(<HotCounter />);
      expect(renderer.getRenderOutput().props.children).to.equal(1);
    });
  });

  describe('instance property', () => {
    it('is available on hotified class instance', () => {
      const HotInstanceProperty = hotify(InstanceProperty);
      const instance = renderer.render(<HotInstanceProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(instance.answer).to.equal(42);
    });

    it('is left unchanged when reassigned', () => {
      const HotInstanceProperty = hotify(InstanceProperty);
      const instance = renderer.render(<HotInstanceProperty />);
      expect(renderer.getRenderOutput().props.children).to.eql(42);

      instance.answer = 100;

      hotify(InstancePropertyUpdate);
      renderer.render(<HotInstanceProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(100);
      expect(instance.answer).to.equal(100);

      hotify(InstancePropertyRemoval);
      renderer.render(<HotInstanceProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(100);
      expect(instance.answer).to.equal(100);
    });

    /**
     * I'm not aware of any way of retrieving their new values
     * without calling the constructor, which seems like too much
     * of a side effect. We also don't want to overwrite them
     * in case they changed.
     */
    it('is left unchanged when not reassigned', () => {
      const HotInstanceProperty = hotify(InstanceProperty);
      const instance = renderer.render(<HotInstanceProperty />);
      expect(renderer.getRenderOutput().props.children).to.eql(42);

      hotify(InstancePropertyUpdate);
      renderer.render(<HotInstanceProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(instance.answer).to.equal(42);

      hotify(InstancePropertyRemoval);
      renderer.render(<HotInstanceProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(instance.answer).to.equal(42);
    });
  });

  describe('static method', () => {
    it('is available on hotified class instance', () => {
      const HotStaticMethod = hotify(StaticMethod);
      const instance = renderer.render(<HotStaticMethod />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(HotStaticMethod.getAnswer()).to.equal(42);
    });

    it('gets replaced', () => {
      const HotStaticMethod = hotify(StaticMethod);
      const instance = renderer.render(<HotStaticMethod />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(HotStaticMethod.getAnswer()).to.equal(42);

      hotify(StaticMethodUpdate);
      renderer.render(<HotStaticMethod />);
      expect(renderer.getRenderOutput().props.children).to.equal(43);
      expect(HotStaticMethod.getAnswer()).to.equal(43);
    });

    /**
     * Known limitation.
     * If you find a way around it without breaking other tests, let me know!
     */
    it('does not get replaced if bound', () => {
      const HotStaticMethod = hotify(StaticMethod);
      const getAnswer = HotStaticMethod.getAnswer = HotStaticMethod.getAnswer.bind(HotStaticMethod);

      renderer.render(<HotStaticMethod />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);

      hotify(StaticMethodUpdate);
      renderer.render(<HotStaticMethod />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(HotStaticMethod.getAnswer()).to.equal(42);
      expect(getAnswer()).to.equal(42);
    });

    it('is detached if deleted', () => {
      const HotStaticMethod = hotify(StaticMethod);
      const instance = renderer.render(<HotStaticMethod />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(HotStaticMethod.getAnswer()).to.equal(42);

      hotify(StaticMethodRemoval);
      expect(() => renderer.render(<HotStaticMethod />)).to.throwError();
      expect(HotStaticMethod.getAnswer).to.equal(undefined);
    });
  });

  describe('static property', () => {
    it('is available on hotified class instance', () => {
      const HotStaticProperty = hotify(StaticProperty);
      const instance = renderer.render(<HotStaticProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(HotStaticProperty.answer).to.equal(42);
    });

    it('is changed when not reassigned', () => {
      const HotStaticProperty = hotify(StaticProperty);
      const instance = renderer.render(<HotStaticProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);

      hotify(StaticPropertyUpdate);
      renderer.render(<HotStaticProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(43);
      expect(HotStaticProperty.answer).to.equal(43);

      hotify(StaticPropertyRemoval);
      renderer.render(<HotStaticProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(undefined);
      expect(HotStaticProperty.answer).to.equal(undefined);
    });

    it('is changed for propTypes, contextTypes, childContextTypes', () => {
      const HotPropTypes = hotify(PropTypes);
      expect(HotPropTypes.propTypes.something).to.equal(React.PropTypes.number);
      expect(HotPropTypes.contextTypes.something).to.equal(React.PropTypes.number);
      expect(HotPropTypes.childContextTypes.something).to.equal(React.PropTypes.number);

      hotify(PropTypesUpdate);
      expect(HotPropTypes.propTypes.something).to.equal(React.PropTypes.string);
      expect(HotPropTypes.contextTypes.something).to.equal(React.PropTypes.string);
      expect(HotPropTypes.childContextTypes.something).to.equal(React.PropTypes.string);
    });

    /**
     * Sometimes people dynamically store stuff on statics.
     */
    it('is not changed when reassigned', () => {
      const HotStaticProperty = hotify(StaticProperty);
      const instance = renderer.render(<HotStaticProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);

      HotStaticProperty.answer = 100;

      hotify(StaticPropertyUpdate);
      renderer.render(<HotStaticProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(100);
      expect(HotStaticProperty.answer).to.equal(100);

      hotify(StaticPropertyRemoval);
      renderer.render(<HotStaticProperty />);
      expect(renderer.getRenderOutput().props.children).to.equal(100);
      expect(HotStaticProperty.answer).to.equal(100);
    });
  });
});