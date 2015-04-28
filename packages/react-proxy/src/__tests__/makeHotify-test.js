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
  render() {
    return <div>Baz</div>;
  }
}

class Foo {
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

  it('replaces an instance method', () => {
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

  it('replaces a bound instance method', () => {
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

  it('turns a deleted instance method into a no-op and removes it', () => {
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

  it('turns a deleted bound instance method into a no-op and keeps it', () => {
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